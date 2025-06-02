/**
 * products.js - Product catalog page functionality
 * 
 * This script handles the products listing page including:
 * - Loading and displaying products
 * - Category filtering
 * - "Add to cart" functionality
 * - Notifications
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu toggle
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
 * 
 * @param {string} category - Optional category filter
 */
function loadProducts(category = 'Alle') {
  const productsContainer = document.getElementById('products-grid');
  if (!productsContainer) return;
  
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
        console.log('Products loaded from JSON:', data);
        products = data;
        // Save to localStorage for future use
        localStorage.setItem('products', JSON.stringify(products));
        displayProducts(products, productsContainer, category);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<p class="text-center text-gray-500">Error loading products</p>';
      });
  } else {
    // Use products from localStorage
    displayProducts(products, productsContainer, category);
  }
}

/**
 * Displays products in the container with consistent styling
 * 
 * @param {Array} products - Array of product objects
 * @param {HTMLElement} container - Container element to display products in
 * @param {string} category - Category filter (or 'Alle' for all products)
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
        <button id="reset-filters" class="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition">
          Toon alle producten
        </button>
      </div>
    `;
    
    // Add event listener to reset button
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
    productCard.className = 'bg-white rounded-lg shadow overflow-hidden flex flex-col transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg';
    
    // Create shortened description for card
    const shortDesc = product.description && product.description.length > 80 
      ? product.description.substring(0, 80) + '...' 
      : (product.description || '');
    
    productCard.innerHTML = `
      <a href="product-detail.html?id=${product.id}" class="block bg-gray-100 p-4 h-48 flex items-center justify-center">
        <img src="../${product.image}" alt="${product.name}" class="max-h-full max-w-full object-contain">
      </a>
      <div class="p-4 flex-grow flex flex-col">
        <a href="product-detail.html?id=${product.id}" class="hover:text-teal-600">
          <h3 class="text-lg font-semibold text-gray-900">${product.name}</h3>
        </a>
        <p class="mt-1 text-sm text-gray-600 line-clamp-2 flex-grow">${shortDesc}</p>
        <div class="mt-4">
          <p class="text-xl font-bold text-gray-900 mb-2">€${product.price.toFixed(2)}</p>
          <button class="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 transition flex items-center justify-center add-to-cart"
            data-id="${product.id}" 
            data-name="${product.name}" 
            data-price="${product.price}"
            data-image="${product.image}">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            In winkelwagen
          </button>
        </div>
      </div>
    `;
    
    container.appendChild(productCard);
  });
  
  // Add event listeners for "Add to cart" buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
      const productId = parseInt(this.getAttribute('data-id'));
      const productName = this.getAttribute('data-name');
      const productPrice = parseFloat(this.getAttribute('data-price'));
      const productImage = this.getAttribute('data-image');
      
      addToCart({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
      });
    });
  });
}

/**
 * Sets up the category filter buttons
 */
function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll('.category-filter');
  if (!filterButtons.length) return;
  
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
 * 
 * @param {Object} product - Product object to add to cart
 */
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  const existingItemIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Show notification instead of alert
  showNotification(product.name);
}

/**
 * Shows a notification when adding to cart
 * Creates or updates a notification element
 * 
 * @param {string} productName - Name of the product that was added
 */
function showNotification(productName) {
  // Check if a notification exists already
  let notification = document.getElementById('cart-notification');
  
  // If not, create a new one
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.className = 'fixed top-4 right-4 bg-teal-500 text-white px-4 py-3 rounded shadow-lg z-50 transform transition-all duration-300 translate-x-full opacity-0 flex items-center';
    
    document.body.appendChild(notification);
  }
  
  // Update the message
  notification.innerHTML = `
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    ${productName} toegevoegd aan winkelwagen!
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
  if (!cartCountElement) return;
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElement.textContent = itemCount;
}