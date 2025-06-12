/**
 * main.js
 */

document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Update cart counter on page load
    updateCartCount();

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
 * Adds a product to the shopping cart
 * If the product is already in the cart, increases the quantity
 */
function addToCart(product) {
    // Get current cart from localStorage or initialize empty array
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Product exists, increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Product doesn't exist, add it to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart counter in UI
    updateCartCount();

    // Notify user that product was added
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
 * Updates the cart item counter in the navigation bar
 * Calculates total quantity of all items in cart
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) {
        return;
    }

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Calculate total quantity
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Update UI
    cartCountElement.textContent = itemCount;
}