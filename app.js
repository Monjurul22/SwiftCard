const BASE_URL = 'https://fakestoreapi.com';

let allProducts = [];
let currentCategory = 'all';
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load function when website loads first time
document.addEventListener("DOMContentLoaded", () => {
    window.trendingGrid = document.getElementById("trendingGrid");
    window.productsGrid = document.getElementById("productsGrid");
    window.categoryFilter = document.getElementById('categoryFilter');
    window.modalBody = document.getElementById('modalContent');
    window.productModal = document.getElementById('productModal');

    if (trendingGrid) loadTrendingProducts();
    if (productsGrid) loadAllProducts();
    if (categoryFilter) {
        loadCategories();
        const allBtn = categoryFilter.querySelector('[data-category="all"]');
        if (allBtn) {
            allBtn.addEventListener('click', () => filterByCategory('all'));
        }
    }

    // ── NEW: build cart drawer & attach click ──
    buildCartDrawer();
    updateCartCount();
    const cartBtn = document.querySelector('.navbar-end .btn-circle');
    if (cartBtn) cartBtn.addEventListener('click', toggleCartDrawer);
});

// ─────────────────────────────────────────────
//  CART DRAWER  (new code)
// ─────────────────────────────────────────────

function buildCartDrawer() {
    // dim background
    const overlay = document.createElement('div');
    overlay.id = 'cartOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9000;display:none;opacity:0;transition:opacity .3s ease;';
    overlay.addEventListener('click', closeCartDrawer);

    // side panel
    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.style.cssText = 'position:fixed;top:0;right:0;height:100vh;width:380px;max-width:100vw;background:#fff;z-index:9001;transform:translateX(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:-6px 0 30px rgba(0,0,0,.12);';

    drawer.innerHTML = `
        <div style="padding:18px 22px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:10px;">
                <i class="fas fa-shopping-bag" style="color:#4f46e5;font-size:18px;"></i>
                <span style="font-size:18px;font-weight:700;color:#111;">My Cart</span>
                <span id="drawerCount" style="background:#4f46e5;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;">0</span>
            </div>
            <button onclick="closeCartDrawer()" style="width:34px;height:34px;border-radius:50%;border:none;background:#f4f4f4;cursor:pointer;font-size:15px;color:#555;display:flex;align-items:center;justify-content:center;">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div id="cartItemsList" style="flex:1;overflow-y:auto;padding:12px 20px;"></div>

        <div id="cartFooter" style="padding:18px 22px;border-top:1px solid #f0f0f0;display:none;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <span style="color:#666;font-size:15px;">Total</span>
                <span id="cartGrandTotal" style="font-size:22px;font-weight:800;color:#4f46e5;">$0.00</span>
            </div>
            <button onclick="clearCart()" style="width:100%;padding:11px;margin-bottom:10px;border:2px solid #4f46e5;background:#fff;color:#4f46e5;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">
                <i class="fas fa-trash-alt" style="margin-right:6px;"></i>Clear Cart
            </button>
            <button style="width:100%;padding:13px;border:none;background:#4f46e5;color:#fff;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">
                <i class="fas fa-credit-card" style="margin-right:6px;"></i>Checkout
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    drawer.style.transform === 'translateX(0%)' ? closeCartDrawer() : openCartDrawer();
}

function openCartDrawer() {
    const overlay = document.getElementById('cartOverlay');
    const drawer  = document.getElementById('cartDrawer');
    renderCartDrawer();
    overlay.style.display = 'block';
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        drawer.style.transform = 'translateX(0%)';
    });
    document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
    const overlay = document.getElementById('cartOverlay');
    const drawer  = document.getElementById('cartDrawer');
    drawer.style.transform = 'translateX(100%)';
    overlay.style.opacity  = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 320);
    document.body.style.overflow = '';
}

function renderCartDrawer() {
    const list    = document.getElementById('cartItemsList');
    const footer  = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartGrandTotal');
    const badge   = document.getElementById('drawerCount');
    if (!list) return;

    const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
    if (badge) badge.textContent = totalQty;

    if (cart.length === 0) {
        list.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:14px;text-align:center;">
                <i class="fas fa-shopping-cart" style="font-size:56px;color:#e5e7eb;"></i>
                <p style="font-size:17px;font-weight:600;color:#9ca3af;">Your cart is empty</p>
                <button onclick="closeCartDrawer()" style="padding:9px 22px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Shop Now</button>
            </div>`;
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = 'block';
    list.innerHTML = '';

    cart.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:12px;align-items:center;padding:13px 0;border-bottom:1px solid #f5f5f5;';
        row.innerHTML = `
            <img src="${item.image}" alt="${item.title}" style="width:68px;height:68px;object-fit:contain;background:#f9fafb;border-radius:10px;padding:6px;flex-shrink:0;">
            <div style="flex:1;min-width:0;">
                <p style="font-size:13px;font-weight:600;color:#111;margin:0 0 3px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${item.title}</p>
                <p style="font-size:12px;color:#9ca3af;margin:0 0 8px;">$${item.price.toFixed(2)} each</p>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button onclick="changeQty(${item.id}, -1)" style="width:26px;height:26px;border-radius:6px;border:1.5px solid #e5e7eb;background:#fff;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#555;">−</button>
                    <span style="font-weight:700;font-size:14px;color:#111;min-width:20px;text-align:center;">${item.quantity}</span>
                    <button onclick="changeQty(${item.id}, 1)" style="width:26px;height:26px;border-radius:6px;border:1.5px solid #e5e7eb;background:#fff;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#555;">+</button>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
                <span style="font-weight:800;color:#4f46e5;font-size:14px;">$${(item.price * item.quantity).toFixed(2)}</span>
                <button onclick="removeFromCart(${item.id})" style="width:30px;height:30px;border-radius:7px;border:none;background:#fff0f0;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-trash" style="color:#ef4444;font-size:13px;"></i>
                </button>
            </div>`;
        list.appendChild(row);
    });

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartDrawer();
    showToast('Item removed 🗑️');
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) { removeFromCart(productId); return; }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartDrawer();
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartDrawer();
    showToast('Cart cleared!');
}

// ─────────────────────────────────────────────
//  ORIGINAL CODE (unchanged below)
// ─────────────────────────────────────────────

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch(`${BASE_URL}/products/categories`);
        const categories = await response.json();

        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn px-6 py-3 border-2 border-gray-200 bg-white text-gray-900 rounded-full font-medium hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 capitalize';
            btn.textContent = category;
            btn.dataset.category = category;
            btn.addEventListener('click', () => filterByCategory(category));
            categoryFilter.appendChild(btn);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load Trending Products (top 3 by rating)
async function loadTrendingProducts() {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        const products = await response.json();
        const trendingThree = products
            .sort((a, b) => b.rating.rate - a.rating.rate)
            .slice(0, 3);
        allProducts = [...allProducts, ...trendingThree.filter(t => !allProducts.find(p => p.id === t.id))];
        displayProducts(trendingThree, trendingGrid);
    } catch (error) {
        console.error('Error loading trending products:', error);
        trendingGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load trending products.</p>';
    }
}

// Load All Products
async function loadAllProducts() {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        allProducts = await response.json();
        displayProducts(allProducts, productsGrid);
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load products. Please try again later.</p>';
    }
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300';

    const stars = generateStars(product.rating.rate);

    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="w-full h-72 object-contain p-6 bg-gray-50" loading="lazy">
        <div class="p-6">
            <span class="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full capitalize mb-3">${product.category}</span>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 overflow-hidden text-ellipsis line-clamp-2 min-h-[3.5rem]">${product.title}</h3>
            <div class="flex items-center gap-2 mb-3">
                <span class="text-yellow-400 text-sm">${stars}</span>
                <span class="text-gray-500 text-sm">(${product.rating.count})</span>
            </div>
            <div class="text-2xl font-bold text-primary mb-4">$${product.price.toFixed(2)}</div>
            <div class="flex gap-3">
                <button
                    class="flex-1 px-4 py-3 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                    onclick="showProductDetails(${product.id})">
                    <i class="fas fa-info-circle"></i> Details
                </button>
                <button
                    class="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-colors duration-300"
                    onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add
                </button>
            </div>
        </div>
    `;

    return card;
}

// Display Products
function displayProducts(products, container) {
    if (!container) return;
    container.innerHTML = '';
    if (products.length === 0) {
        container.innerHTML = '<p class="text-4xl text-center col-span-full py-12">No products found.</p>';
        return;
    }
    products.forEach(p => {
        const card = createProductCard(p);
        container.appendChild(card);
    });
}

// Filter Products by Category
async function filterByCategory(category) {
    currentCategory = category;

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white', 'border-primary');
        btn.classList.add('bg-white', 'text-gray-900', 'border-gray-200');

        if (btn.dataset.category === category) {
            btn.classList.add('bg-primary', 'text-white', 'border-primary');
            btn.classList.remove('bg-white', 'text-gray-900', 'border-gray-200');
        }
    });

    productsGrid.innerHTML = `
        <div class="col-span-full flex justify-center items-center min-h-[200px]">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        </div>`;

    try {
        let products;
        if (category === 'all') {
            products = allProducts.length > 0
                ? allProducts
                : await fetch(`${BASE_URL}/products`).then(r => r.json());
        } else {
            const response = await fetch(`${BASE_URL}/products/category/${category}`);
            products = await response.json();
        }
        displayProducts(products, productsGrid);
    } catch (error) {
        console.error('Error filtering products:', error);
        productsGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load products. Please try again later.</p>';
    }
}

// Show Product Details in Modal
async function showProductDetails(productId) {
    if (!productModal) return;

    modalBody.innerHTML = `
        <div class="flex justify-center items-center min-h-[200px]">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        </div>`;
    productModal.showModal();

    try {
        const response = await fetch(`${BASE_URL}/products/${productId}`);
        const product = await response.json();
        const stars = generateStars(product.rating.rate);

        modalBody.innerHTML = `
            <div class="max-w-5xl w-full">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    <div class="bg-gray-50 rounded-xl p-8 flex items-center justify-center">
                        <img src="${product.image}" alt="${product.title}" class="max-h-[350px] object-contain">
                    </div>
                    <div class="flex flex-col">
                        <h2 class="text-2xl lg:text-3xl font-bold mb-4 text-gray-900 leading-snug">
                            ${product.title}
                        </h2>
                        <span class="inline-block w-fit px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full capitalize mb-4">
                            ${product.category}
                        </span>
                        <div class="flex items-center gap-2 mb-4">
                            <span class="text-yellow-400 text-lg">${stars}</span>
                            <span class="text-gray-500 text-sm">(${product.rating.count} reviews)</span>
                        </div>
                        <div class="text-3xl font-bold text-primary mb-6">$${product.price.toFixed(2)}</div>
                        <p class="text-gray-600 leading-relaxed mb-8 text-sm lg:text-base">
                            ${product.description}
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 mt-auto">
                            <button
                                class="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                                onclick="buyNow(${product.id})">
                                <i class="fas fa-shopping-bag mr-2"></i> Buy Now
                            </button>
                            <button
                                class="flex-1 border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition"
                                onclick="addToCartFromModal(${product.id}, ${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                <i class="fas fa-cart-plus mr-2"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalBox = productModal.querySelector('.modal-box');
        if (modalBox) {
            modalBox.classList.add('max-w-5xl', 'w-11/12');
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        modalBody.innerHTML = '<p class="text-center text-red-500 py-8">Failed to load product details. Please try again.</p>';
    }
}

// Add to Cart from Modal
function addToCartFromModal(productId, product) {
    if (!allProducts.find(p => p.id === productId)) {
        allProducts.push(product);
    }
    addToCart(productId);
    closeModal();
}

// Add to Cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.warn('Product not found in allProducts:', productId);
        return;
    }

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Product added to cart! 🛒');
}

// Update Cart Count in Navbar
function updateCartCount() {
    const badges = document.querySelectorAll('.indicator-item');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badges.forEach(badge => badge.textContent = totalItems);
    // also update drawer badge
    const drawerBadge = document.getElementById('drawerCount');
    if (drawerBadge) drawerBadge.textContent = totalItems;
}

// Buy Now
function buyNow(productId) {
    addToCart(productId);
    closeModal();
    showToast('Proceeding to checkout! 🎉');
}

// Close Modal
function closeModal() {
    if (productModal) {
        productModal.close();
    }
}

// Toast notification
function showToast(message) {
    const existing = document.getElementById('swiftcart-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'swiftcart-toast';
    toast.className = 'fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 opacity-0';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Generate Star Rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}