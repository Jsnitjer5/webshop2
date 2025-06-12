/**
 * products.js - Product catalog page with fixed layout
 */

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    }

    // Load all products on page load
    loadProducts();

    // Setup category filter buttons
    setupCategoryFilters();

    // Ensure cart counter is updated
    updateCartCount();
});

/**
 * Loads products from localStorage or JSON and displays them
 */
function loadProducts(category = 'Alle') {
    const productsContainer = document.getElementById('products-grid');
    if (!productsContainer) {
        return;
    }

    // Try to get products from localStorage first
    let products = JSON.parse(localStorage.getItem('products'));

    if (!products) {
        // If no products in localStorage, fetch from JSON file
        fetch('../data/products.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error when fetching products');
                }
                return response.json();
            })
            .then(data => {
                products = data;
                // Save to localStorage for future use
                localStorage.setItem('products', JSON.stringify(products));
                displayProducts(products, productsContainer, category);
            })
            .catch(error => {
                console.error('Error loading products:', error);
                const errorMsg = '<p class="text-center text-gray-500">Error loading products</p>';
                productsContainer.innerHTML = errorMsg;
            });
    } else {
        // Use products from localStorage
        displayProducts(products, productsContainer, category);
    }
}

/**
 * Displays products in the container
 */
function displayProducts(products, container, category) {
    // Filter by category if needed
    let filteredProducts = products;
    if (category !== 'Alle') {
        filteredProducts = products.filter(product => product.category === category);
    }

    // Clear container before adding new content
    container.innerHTML = '';

    // Show message if no products in this category
    if (filteredProducts.length === 0) {
        container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-500 text-lg">Geen producten gevonden in deze categorie.</p>
        <button id="reset-filters" 
                class="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition">
          Toon alle producten
        </button>
      </div>
    `;

        // Reset button
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                // Reset category filter UI
                document.querySelectorAll('.category-filter').forEach(btn => {
                    btn.classList.remove('bg-teal-500', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });

                // Activate "All" filter button
                const allButton = document.querySelector('[data-category="Alle"]');
                if (allButton) {
                    allButton.classList.add('bg-teal-500', 'text-white');
                    allButton.classList.remove('bg-gray-200', 'text-gray-700');
                }

                // Load all products
                loadProducts();
            });
        }

        return;
    }

    // Create and display product cards
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');

        productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full ' +
                                'transition-all duration-300 hover:shadow-lg hover:-translate-y-1';

        // Create shortened description for card
        const shortDesc = product.description && product.description.length > 80
            ? product.description.substring(0, 80) + '...'
            : (product.description || '');

        productCard.innerHTML = `
      <!-- Image container with proper constraints -->
      <div class="relative h-48 bg-gray-100 flex items-center justify-center p-4 border-b border-gray-200">
        <a href="product-detail.html?id=${product.id}" class="w-full h-full flex items-center justify-center">
          <img src="../${product.image}" 
               alt="${product.name}" 
               class="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
               onerror="this.src='../img/placeholder.png'">
        </a>
      </div>
      
      <div class="flex flex-col flex-grow p-4">
        <!-- Product title -->
        <div class="mb-2">
          <a href="product-detail.html?id=${product.id}" 
          class="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-200 line-clamp-2">
            ${product.name}
          </a>
        </div>
        
        <!-- Product description -->
        <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
          ${shortDesc}
        </p>
        
        <!-- Price and button section - always at bottom -->
        <div class="mt-auto">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xl font-bold text-gray-900">€${product.price.toFixed(2)}</span>
            ${product.stock > 0
        ? '<span class="text-xs text-green-600 font-medium">Op voorraad</span>'
        : '<span class="text-xs text-red-600 font-medium">Uitverkocht</span>'
}
          </div>
          
          <button class="w-full py-2 px-4 bg-teal-500 text-white rounded-md hover:bg-teal-600 
                         transition-colors duration-200 flex items-center justify-center add-to-cart
                         ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                  data-id="${product.id}" 
                  data-name="${product.name}" 
                  data-price="${product.price}"
                  data-image="${product.image}"
                  ${product.stock <= 0 ? 'disabled' : ''}>
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 
                    1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            ${product.stock > 0 ? 'In winkelwagen' : 'Uitverkocht'}
          </button>
        </div>
      </div>
    `;

        container.appendChild(productCard);
    });

    // Add event listeners for "Add to cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            // Don't add if disabled (out of stock)
            if (this.disabled) {
                return;
            }

            const productId = parseInt(this.getAttribute('data-id'));
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');

            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1,
            });
        });
    });
}

/**
 * Sets up the category filter buttons
 */
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.category-filter');
    if (!filterButtons.length) {
        return;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Update active filter styling
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-teal-500', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });

            this.classList.add('bg-teal-500', 'text-white');
            this.classList.remove('bg-gray-200', 'text-gray-700');

            // Load filtered products
            loadProducts(category);
        });
    });

    // Check URL parameters for initial category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    if (categoryParam) {
        // Find and activate corresponding category button
        const categoryButton = document.querySelector(`[data-category="${categoryParam}"]`);
        if (categoryButton) {
            categoryButton.click();
        }
    }
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

    showNotification(product.name);
}

/**
 * Shows a notification when adding to cart
 */
function showNotification(productName) {
    // Check if a notification exists already
    let notification = document.getElementById('cart-notification');

    // If not, create a new one
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'fixed top-4 right-4 bg-teal-500 text-white px-4 py-3 rounded-lg ' +
                                 'shadow-lg z-50 transform transition-all duration-300 ' +
                                 'translate-x-full opacity-0 flex items-center max-w-sm';

        document.body.appendChild(notification);
    }

    // Update the message
    notification.innerHTML = `
    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span class="text-sm font-medium">${productName} toegevoegd aan winkelwagen!</span>
  `;

    // Show the notification with a slight delay for animation
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

/**
 * Updates the cart counter in the navigation
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