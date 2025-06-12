document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    }

    // Display order confirmation details
    displayOrderConfirmation();

    // Update cart counter (should be 0 after a successful order)
    updateCartCount();
});

/**
 * Displays the order confirmation details
 * Retrieves order information from localStorage and shows it on the page
 * Redirects to home page if no order data is found
 */
function displayOrderConfirmation() {
    // Get current order from localStorage
    const orderJson = localStorage.getItem('currentOrder');

    if (!orderJson) {
        // If no order data is found, redirect to home page
        window.location.href = 'index.html';
        return;
    }

    // Parse the order data
    const order = JSON.parse(orderJson);

    // Format order number (last 6 digits of timestamp with padding)
    const orderNumber = order.id.toString().substr(-6).padStart(6, '0');

    // Format date to locale format
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Display order details in confirmation page
    document.getElementById('order-number').textContent = `#${orderNumber}`;
    document.getElementById('order-date').textContent = formattedDate;
    const customerNameText = `${order.customer.firstName} ${order.customer.lastName}`;
    document.getElementById('customer-name').textContent = customerNameText;
    document.getElementById('customer-email').textContent = order.customer.email;
    const shippingAddressText = `${order.customer.address}, ` +
        `${order.customer.postalCode} ${order.customer.city}`;
    document.getElementById('shipping-address').textContent = shippingAddressText;
    document.getElementById('payment-method').textContent = order.payment;

    // Display ordered products
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';

    order.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'py-4 flex';

        itemElement.innerHTML = `
            <div class="flex-1 flex">
                <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    <img src="${item.image}" alt="${item.name}" 
                         class="w-full h-full object-center object-cover">
                </div>
                <div class="ml-4 flex-1">
                    <div class="font-medium text-gray-900">${item.name}</div>
                    <div class="mt-1 flex items-center">
                        <span class="text-sm text-gray-500">€${item.price.toFixed(2)}</span>
                        <span class="mx-2 text-gray-400">×</span>
                        <span class="text-sm text-gray-500">${item.quantity}</span>
                    </div>
                </div>
            </div>
            <div class="ml-4 text-base font-medium text-gray-900">
                €${(item.price * item.quantity).toFixed(2)}
            </div>
        `;

        orderItemsContainer.appendChild(itemElement);
    });

    // Display order summary
    document.getElementById('order-subtotal').textContent = `€${order.subtotal.toFixed(2)}`;
    const shippingText = order.shipping === 0 ? 'Gratis' : `€${order.shipping.toFixed(2)}`;
    document.getElementById('order-shipping').textContent = shippingText;
    document.getElementById('order-total').textContent = `€${order.total.toFixed(2)}`;

    // Add success animation to the checkmark icon
    const successIcon = document.querySelector('.text-green-500');
    if (successIcon) {
        successIcon.classList.add('transform', 'transition-all', 'duration-700');
        setTimeout(() => {
            successIcon.classList.add('scale-110');
            setTimeout(() => {
                successIcon.classList.remove('scale-110');
            }, 500);
        }, 300);
    }

    // Clear the current order from localStorage to prevent
    // seeing the same confirmation if the page is refreshed
    localStorage.removeItem('currentOrder');
}

/**
 * Updates the cart count in the navigation
 * Should be 0 after a successful checkout
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) {
        return;
    }

    // Get cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Calculate total number of items
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Update the cart count element
    cartCountElement.textContent = itemCount;
}