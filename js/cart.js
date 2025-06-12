document.addEventListener('DOMContentLoaded', function () {
    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    }

    // Display cart items on page load
    displayCartItems();

    // Update cart counter in navigation
    updateCartCount();

    // Add event listener to "Clear cart" button
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // Add event listener to checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

/**
 * Clean confirmation modal using only Tailwind classes - IMPROVED VERSION
 */
function showConfirmModal(message, title = 'Bevestigen') {
    return new Promise((resolve) => {
        // Remove any existing modals first
        const existingModal = document.querySelector('.confirm-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'confirm-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';

        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-200 scale-95 opacity-0';

        // Create title
        const titleElement = document.createElement('h3');
        titleElement.className = 'text-lg font-semibold text-gray-900 mb-3 text-center';
        titleElement.textContent = title;

        // Create message
        const messageElement = document.createElement('p');
        messageElement.className = 'text-sm text-gray-600 mb-6 text-center leading-relaxed';
        messageElement.textContent = message;

        // Create button container with explicit styling
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex space-x-3 justify-center';
        
        // Use innerHTML to ensure both buttons are created properly
        buttonContainer.innerHTML = `
            <button id="modal-cancel" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200">
                Annuleren
            </button>
            <button id="modal-confirm" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors duration-200">
                Ja
            </button>
        `;

        // Get button references after innerHTML
        const cancelButton = buttonContainer.querySelector('#modal-cancel');
        const confirmButton = buttonContainer.querySelector('#modal-confirm');
        modalContainer.appendChild(titleElement);
        modalContainer.appendChild(messageElement);
        modalContainer.appendChild(buttonContainer);
        modalBackdrop.appendChild(modalContainer);
        document.body.appendChild(modalBackdrop);

        // Prevent body scroll
        document.body.classList.add('overflow-hidden');

        // Animate in
        requestAnimationFrame(() => {
            modalContainer.classList.remove('scale-95', 'opacity-0');
            modalContainer.classList.add('scale-100', 'opacity-100');
        });

        const cleanup = () => {
            // Animate out
            modalContainer.classList.add('scale-95', 'opacity-0');
            modalContainer.classList.remove('scale-100', 'opacity-100');
            
            setTimeout(() => {
                if (modalBackdrop && modalBackdrop.parentNode) {
                    modalBackdrop.remove();
                }
                document.body.classList.remove('overflow-hidden');
            }, 200);
        };

        // Event listeners
        confirmButton.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });

        cancelButton.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });

        // Close on backdrop click
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                cleanup();
                resolve(false);
            }
        });

        // Close on Escape key
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);

        // Focus cancel button
        setTimeout(() => cancelButton.focus(), 100);
    });
}

/**
 * Displays all items in the shopping cart
 * Handles both empty cart display and populated cart
 */
function displayCartItems() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const cartEmptyMessage = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');

    if (!cartContainer) {
        return;
    }

    // Retrieve cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Handle empty cart
    if (cart.length === 0) {
        if (cartEmptyMessage) {
            cartEmptyMessage.classList.remove('hidden');
        }
        if (cartContent) {
            cartContent.classList.add('hidden');
        }
        return;
    }

    // Show cart content
    if (cartEmptyMessage) {
        cartEmptyMessage.classList.add('hidden');
    }
    if (cartContent) {
        cartContent.classList.remove('hidden');
    }

    cartContainer.innerHTML = '';

    let total = 0;

    // Create HTML elements for each product in cart
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'flex items-center justify-between p-4 border-b hover:bg-gray-50';
        cartItem.innerHTML = `
            <div class="flex items-center">
                <div class="w-16 h-16 mr-4 bg-gray-100 rounded overflow-hidden">
                    <img src="${item.image}" alt="${item.name}" 
                         class="w-full h-full object-contain">
                </div>
                <div>
                    <h3 class="text-lg font-medium text-gray-900">${item.name}</h3>
                    <p class="text-gray-600">€${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="flex items-center">
                <div class="flex items-center border rounded overflow-hidden">
                    <button class="decrease-quantity px-3 py-1 text-lg text-gray-600 
                                   hover:bg-gray-100" data-index="${index}">-</button>
                    <span class="px-3 py-1 border-l border-r">${item.quantity}</span>
                    <button class="increase-quantity px-3 py-1 text-lg text-gray-600 
                                   hover:bg-gray-100" data-index="${index}">+</button>
                </div>
                <span class="ml-4 text-lg font-medium w-24 text-right">
                    €${itemTotal.toFixed(2)}
                </span>
                <button class="remove-item ml-4 p-1 text-red-500 hover:text-red-700" 
                        data-index="${index}">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" 
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" 
                              stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    });

    // Add event listeners to quantity buttons and remove buttons
    // This is crucial to reapply after modifying the DOM
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            updateItemQuantity(index, cart[index].quantity + 1);
        });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                updateItemQuantity(index, cart[index].quantity - 1);
            } else {
                removeCartItem(index);
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            removeCartItem(index);
        });
    });

    // Update order summary
    if (cartSummary) {
        const shipping = total > 50 ? 0 : 4.95;
        const grandTotal = total + shipping;

        cartSummary.innerHTML = `
            <div class="flex justify-between mb-2">
                <span class="font-medium text-gray-700">Subtotaal</span>
                <span class="text-gray-900">€${total.toFixed(2)}</span>
            </div>
            <div class="flex justify-between mb-2">
                <span class="font-medium text-gray-700">Verzendkosten</span>
                <span class="${shipping === 0 ? 'text-green-600' : 'text-gray-900'}">
                    ${shipping === 0 ? 'Gratis' : '€' + shipping.toFixed(2)}
                </span>
            </div>
            <div class="border-t pt-2 mt-2">
                <div class="flex justify-between font-medium text-lg">
                    <span class="text-gray-900">Totaal</span>
                    <span class="text-gray-900">€${grandTotal.toFixed(2)}</span>
                </div>
                ${shipping === 0 ?
        '<p class="mt-1 text-sm text-green-600">✓ Gratis verzending</p>' :
        `<p class="mt-1 text-xs text-gray-500">Nog €${(50 - total).toFixed(2)} ` +
        'tot gratis verzending</p>'
}
            </div>
        `;
    }
}

/**
 * Updates the quantity of a specific item in the cart
 */
function updateItemQuantity(index, newQuantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (index >= 0 && index < cart.length) {
        cart[index].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));

        updateCartCount();
        displayCartItems();
    }
}

/**
 * Removes an item from the cart
 */
function removeCartItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (index >= 0 && index < cart.length) {
        // Remove item at specified index using splice
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update UI
        updateCartCount();
        displayCartItems();
    }
}

/**
 * Clears the entire cart after confirmation
 */
async function clearCart() {
    const confirmed = await showConfirmModal(
        'Weet u zeker dat u de winkelwagen wilt leegmaken?',
        'Winkelwagen leegmaken'
    );

    if (confirmed) {
        localStorage.removeItem('cart');
        updateCartCount();
        displayCartItems();
    }
}

/**
 * Processes the checkout form submission
 */
function handleCheckout(event) {
    event.preventDefault();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        showNotification('Uw winkelwagen is leeg', 'error');
        return;
    }

    // Get customer information from form
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const postalCode = document.getElementById('postal-code').value;
    const city = document.getElementById('city').value;

    // Determine selected payment method
    let paymentMethod = '';
    if (document.getElementById('payment-ideal').checked) {
        paymentMethod = 'iDEAL';
    } else if (document.getElementById('payment-creditcard').checked) {
        paymentMethod = 'Credit Card';
    } else if (document.getElementById('payment-paypal').checked) {
        paymentMethod = 'PayPal';
    }

    // Calculate order totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 4.95;
    const total = subtotal + shipping;

    // Create order object
    const order = {
        id: Date.now(), // Use timestamp as unique ID
        date: new Date().toISOString(),
        customer: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            address: address,
            postalCode: postalCode,
            city: city
        },
        items: cart,
        payment: paymentMethod,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'Nieuw'
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Save current order for confirmation page
    localStorage.setItem('currentOrder', JSON.stringify(order));

    // Empty cart
    localStorage.removeItem('cart');

    // Use a timeout to ensure localStorage changes are saved before redirecting
    setTimeout(function () {
        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
    }, 300);
}

/**
 * Shows a notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    let bgColor = 'bg-blue-500';

    if (type === 'success') {
        bgColor = 'bg-green-500';
    } else if (type === 'error') {
        bgColor = 'bg-red-500';
    }

    const notificationClass = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 ` +
        'rounded-lg shadow-lg z-50 transform transition-all duration-300 ' +
        'translate-x-full opacity-0';

    notification.className = notificationClass;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // Hide notification after 3 seconds
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

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    cartCountElement.textContent = itemCount;
}