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
        // FIX #1: "All" button এর জন্য event listener
        const allBtn = categoryFilter.querySelector('[data-category="all"]');
        if (allBtn) {
            allBtn.addEventListener('click', () => filterByCategory('all'));
        }
    }
    updateCartCount();
});

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
        // FIX #2: trending products also stored so addToCart works from homepage
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

    // Highlight active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white', 'border-primary');
        btn.classList.add('bg-white', 'text-gray-900', 'border-gray-200');

        if (btn.dataset.category === category) {
            btn.classList.add('bg-primary', 'text-white', 'border-primary');
            btn.classList.remove('bg-white', 'text-gray-900', 'border-gray-200');
        }
    });

    // Show loading spinner
    productsGrid.innerHTML = `
        <div class="col-span-full flex justify-center items-center min-h-[200px]">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        </div>`;

    try {
        let products;
        if (category === 'all') {
            // FIX #3: use already loaded allProducts, avoid extra fetch
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

    // Show loading state inside modal
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

// FIX #4: Add to Cart from Modal (product may not be in allProducts yet on homepage)
function addToCartFromModal(productId, product) {
    // Ensure product is in allProducts
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

// FIX #5: Toast instead of alert (better UX)
function showToast(message) {
    const existing = document.getElementById('swiftcart-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'swiftcart-toast';
    toast.className = 'fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 opacity-0';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Animate out after 2.5s
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