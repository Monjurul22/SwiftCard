// API Base URL
const URL = 'https://fakestoreapi.com';



document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts()
    loadJeweleryProduc()
})



// product load
async function loadAllProducts() {
    try {
        const response=await fetch(`${URL}/products`)
        const products= await response.json()
        displayProducts(products,allProductGrid)
    } catch (error) {
        console.log(error);      
    }
    
}

async function loadJeweleryProduct() {
    try {
        const responce=await fetch(`${URL}/jewelery`)
        const products=await responce.json()
        displayProducts(products,JeweleryGrid)
    } catch (error) {
        console.log(error);
        
    }
}



function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeIn';
    
    const stars = generateStars(product.rating.rate);
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="w-full h-72 object-contain p-6 bg-gray-50">
        <div class="p-6">
            <span class="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full capitalize mb-3">${product.category}</span>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 overflow-hidden text-ellipsis line-clamp-2 min-h-[3.5rem]">${product.title}</h3>
            <div class="flex items-center gap-2 mb-3">
                <span class="text-yellow-400 text-sm">${stars}</span>
                <span class="text-gray-500 text-sm">(${product.rating.count})</span>
            </div>
            <div class="text-2xl font-bold text-primary mb-4">$${product.price.toFixed(2)}</div>
            <div class="flex gap-3">
                <button class="flex-1 px-4 py-3 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300" onclick="showProductDetails(${product.id})">
                    <i class="fas fa-info-circle"></i> Details
                </button>
                <button class="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-300" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add
                </button>
            </div>
        </div>
    `;
    
    return card;
}


// Display Products
function displayProducts(products, container) {
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">No products found.</p>';
        return;
    }
    
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}
f
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



