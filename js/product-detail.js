// product-detail.js - Improved version with consistent styling
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    });
  }
  
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (productId) {
    loadProductDetails(parseInt(productId));
  } else {
    showErrorMessage();
  }
  
  // Quantity buttons
  const decrementBtn = document.getElementById('decrement-button');
  const incrementBtn = document.getElementById('increment-button');
  const quantityInput = document.getElementById('quantity-input');
  
  if (decrementBtn && incrementBtn && quantityInput) {
    decrementBtn.addEventListener('click', function() {
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      }
    });
    
    incrementBtn.addEventListener('click', function() {
      quantityInput.value = parseInt(quantityInput.value) + 1;
    });
  }
  
  // Set up tabs
  const specsTab = document.getElementById('specs-tab');
  const reviewsTab = document.getElementById('reviews-tab');
  const specsContent = document.getElementById('specs-content');
  
  if (specsTab && reviewsTab) {
    // Initially hide reviews content (if it exists)
    const reviewsContent = document.getElementById('reviews-content');
    if (reviewsContent) {
      reviewsContent.classList.add('hidden');
    }
    
    specsTab.addEventListener('click', function() {
      // Update tab styling
      specsTab.classList.add('text-teal-600', 'border-b-2', 'border-teal-600');
      specsTab.classList.remove('text-gray-500', 'hover:text-gray-700');
      
      reviewsTab.classList.remove('text-teal-600', 'border-b-2', 'border-teal-600');
      reviewsTab.classList.add('text-gray-500', 'hover:text-gray-700');
      
      // Show/hide content
      specsContent.classList.remove('hidden');
      if (reviewsContent) {
        reviewsContent.classList.add('hidden');
      }
    });
    
    reviewsTab.addEventListener('click', function() {
      // Update tab styling
      reviewsTab.classList.add('text-teal-600', 'border-b-2', 'border-teal-600');
      reviewsTab.classList.remove('text-gray-500', 'hover:text-gray-700');
      
      specsTab.classList.remove('text-teal-600', 'border-b-2', 'border-teal-600');
      specsTab.classList.add('text-gray-500', 'hover:text-gray-700');
      
      // Show/hide content
      specsContent.classList.add('hidden');
      if (reviewsContent) {
        reviewsContent.classList.remove('hidden');
      }
    });
  }
  
  // Update cart counter
  updateCartCount();
});

// Load product details
function loadProductDetails(productId) {
  // Show loading spinner
  document.getElementById('loading-spinner').classList.remove('hidden');
  
  // Get products from localStorage or from JSON file
  let products = JSON.parse(localStorage.getItem('products'));
  
  if (!products) {
    // If no products in localStorage, fetch from JSON file
    fetch('data/products.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network error when fetching products');
        }
        return response.json();
      })
      .then(data => {
        console.log('Products loaded from JSON:', data);
        products = data;
        localStorage.setItem('products', JSON.stringify(products));
        
        // Find product in newly loaded products
        const product = products.find(p => p.id === productId);
        if (product) {
          displayProductDetails(product);
        } else {
          showErrorMessage();
        }
      })
      .catch(error => {
        console.error('Error loading products:', error);
        showErrorMessage();
      });
  } else {
    // Find product in localStorage
    const product = products.find(p => p.id === productId);
    if (product) {
      displayProductDetails(product);
    } else {
      showErrorMessage();
    }
  }
}

// Display product details
function displayProductDetails(product) {
  if (!product) {
    showErrorMessage();
    return;
  }
  
  // Update page content
  document.getElementById('product-category-breadcrumb').textContent = product.category;
  document.getElementById('product-name-breadcrumb').textContent = product.name;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = `€${product.price.toFixed(2)}`;
  document.getElementById('product-description').textContent = product.description || '';
  document.title = `${product.name} - PekelPC.nl`;
  
  // Product image
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }
  
  // Stock status with consistent styling
  const stockStatus = document.getElementById('product-stock-status');
  if (stockStatus) {
    if (product.stock > 0) {
      stockStatus.innerHTML = `
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg class="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Op voorraad (${product.stock})
        </span>
      `;
    } else {
      stockStatus.innerHTML = `
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg class="mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Uitverkocht
        </span>
      `;
    }
  }
  
  // Display ratings
  const ratingContainer = document.getElementById('product-rating');
  if (ratingContainer) {
    ratingContainer.innerHTML = generateStarRating(product.rating);
    
    const reviewCount = document.getElementById('product-review-count');
    if (reviewCount) {
      // Randomly generate review count based on rating
      const count = Math.floor(product.rating * 10 + Math.random() * 20);
      reviewCount.textContent = `${count} reviews`;
    }
  }
  
  // Display specifications
  displaySpecifications(product.specifications);
  
  // "Add to cart" button
  const addToCartButton = document.getElementById('add-to-cart-button');
  if (addToCartButton) {
    if (product.stock <= 0) {
      // Disable button if out of stock
      addToCartButton.disabled = true;
      addToCartButton.classList.remove('bg-teal-600', 'hover:bg-teal-700');
      addToCartButton.classList.add('bg-gray-400', 'cursor-not-allowed');
      addToCartButton.innerHTML = `
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
        <span class="text-white">Uitverkocht</span>
      `;
    } else {
      // Ensure consistent styling
      addToCartButton.classList.add('bg-teal-600', 'hover:bg-teal-700');
      addToCartButton.innerHTML = `
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="text-white">In winkelwagen</span>
      `;
      
      addToCartButton.addEventListener('click', function() {
        const quantity = parseInt(document.getElementById('quantity-input').value);
        if (isNaN(quantity) || quantity < 1) {
          alert('Vul een geldig aantal in');
          return;
        }
        
        addToCart(product, quantity);
      });
    }
  }
  
  // Hide spinner and show product details
  document.getElementById('loading-spinner').classList.add('hidden');
  document.getElementById('product-details').classList.remove('hidden');
}

// Helper function to generate star ratings
function generateStarRating(rating) {
  let stars = '';
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars += `
      <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    `;
  }
  
  // Add half star if needed
  if (halfStar) {
    stars += `
      <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    `;
  }
  
  // Add empty stars
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars += `
      <svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    `;
  }
  
  return stars;
}

// Display specifications
function displaySpecifications(specifications) {
  const specsTable = document.getElementById('specifications-table');
  if (!specsTable) return;
  
  specsTable.innerHTML = '';
  
  if (!specifications || Object.keys(specifications).length === 0) {
    specsTable.innerHTML = '<tr><td colspan="2" class="px-4 py-3 text-center text-gray-500">Geen specificaties beschikbaar</td></tr>';
    return;
  }
  
  // Add specifications to table with consistent styling
  for (const [key, value] of Object.entries(specifications)) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">${key}</td>
      <td class="px-4 py-3 text-sm text-gray-500">${value}</td>
    `;
    specsTable.appendChild(row);
  }
}

// Show error message
function showErrorMessage() {
  document.getElementById('loading-spinner').classList.add('hidden');
  document.getElementById('error-message').classList.remove('hidden');
}

// Add product to cart
function addToCart(product, quantity = 1) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  const existingItemIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Show notification instead of alert
  showNotification(product.name, quantity);
}

// Show notification when adding to cart
function showNotification(productName, quantity) {
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
    ${quantity}x ${productName} toegevoegd aan winkelwagen!
  `;
  
  // Show the notification
  setTimeout(() => {
    notification.classList.remove('translate-x-full', 'opacity-0');
  }, 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full', 'opacity-0');
  }, 3000);
}

// Update cart counter
function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (!cartCountElement) return;
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElement.textContent = itemCount;
}