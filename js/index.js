/**
 * index.js - Homepage functionality
 */

document.addEventListener('DOMContentLoaded', function () {
    // Load featured products for the homepage
    loadFeaturedProducts();

    // Update cart counter in navigation
    updateCartCount();

    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    }

    // Setup global event delegation for "Add to cart" buttons
    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const productName = e.target.getAttribute('data-name');
            const productPrice = parseFloat(e.target.getAttribute('data-price'));
            const productImage = e.target.getAttribute('data-image');

            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1,
            });
        }
    });
});

/**
 * Loads and displays featured products on the homepage
 */
function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) {
        return;
    }

    // Set the container to grid with 3 columns
    featuredContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10';

    // Try to get products from localStorage first
    const products = JSON.parse(localStorage.getItem('products'));

    if (products) {
        // Use products from localStorage
        displayFeaturedProducts(products, featuredContainer);
    } else {
        // Load from JSON file
        fetch('../data/products.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('products', JSON.stringify(data));
                displayFeaturedProducts(data, featuredContainer);
            })
            .catch(error => {
                console.error('Error loading featured products:', error);
                featuredContainer.innerHTML = '<p class="text-center text-gray-500 col-span-3">' +
                    'Er is een fout opgetreden bij het laden van producten.</p>';
            });
    }
}

/**
 * Displays featured products in the container
 */
function displayFeaturedProducts(products, container) {
    // Filter only featured products and limit to 3
    const featuredProducts = products.filter(product => product.featured).slice(0, 3);

    if (featuredProducts.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-3">' +
            'Geen uitgelichte producten gevonden.</p>';
        return;
    }

    // Clear container before adding new content
    container.innerHTML = '';

    featuredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col';

        const shortDesc = product.description.length > 50
            ? product.description.substring(0, 50) + '...'
            : product.description;

        card.innerHTML = `
            <div class="h-40 bg-white flex items-center justify-center p-3 border-b border-gray-100">
                <img src="${product.image}" alt="${product.name}" 
                     style="max-height: 120px; max-width: 90%;" class="object-contain">
            </div>
            <div class="p-3 flex flex-col flex-grow">
                <a href="pages/product-detail.html?id=${product.id}" class="block hover:text-teal-600">
                    <h3 class="text-sm font-medium text-gray-900 truncate">${product.name}</h3>
                </a>
                <p class="mt-1 text-xs text-gray-500 line-clamp-2">${shortDesc}</p>
                <div class="mt-auto pt-2 flex items-center justify-between">
                    <span class="text-sm font-bold text-gray-900">€${product.price.toFixed(2)}</span>
                    <button class="add-to-cart px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 transition" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-price="${product.price}" 
                            data-image="${product.image}">
                        In winkelwagen
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Adds a product to the shopping cart
 */
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    showNotification(`${product.name} toegevoegd aan winkelwagen!`);
}

/**
 * Shows a notification message
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-teal-500 text-white px-4 py-3 ' +
        'rounded shadow-lg z-50 transform transition-all duration-300 translate-x-full opacity-0';
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Updates the cart counter in the navigation bar
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) {
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    cartCountElement.textContent = itemCount;
}