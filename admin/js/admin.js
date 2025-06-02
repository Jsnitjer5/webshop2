/**
 * admin.js - Admin panel functionality
 * 
 * This script handles all admin-related functionality including:
 * - Product management (add, edit, delete)
 * - Order management and viewing
 * - Mobile menu functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  
  // Toggle mobile menu
  document.getElementById('menu-toggle')?.addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
  });
  
  // Initialize appropriate page based on URL path
  if (path.includes('/admin/producten.html')) {
    initProductsPage();
  } else if (path.includes('/admin/bestellingen.html')) {
    initOrdersPage();
  }
});

// Default products data for reset functionality
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "AMD Ryzen 7 5800X",
    category: "CPU",
    price: 349.99,
    image: "img/cpu.jpg",
    description: "8-core, 16-thread processor voor gaming.",
    stock: 15,
    featured: true
  },
  {
    id: 2,
    name: "NVIDIA GeForce RTX 3080",
    category: "GPU",
    price: 799.99,
    image: "img/gpu.jpg",
    description: "High-end grafische kaart met ray-tracing.",
    stock: 8,
    featured: true
  },
  {
    id: 3,
    name: "ASUS ROG Strix B550-F",
    category: "Moederbord",
    price: 159.99,
    image: "img/motherboard.jpg",
    description: "Premium ATX moederbord.",
    stock: 12,
    featured: false
  },
  {
    id: 4,
    name: "Corsair Vengeance RGB Pro 32GB",
    category: "RAM",
    price: 139.99,
    image: "img/ram.jpg",
    description: "High-performance DDR4 geheugen.",
    stock: 20,
    featured: false
  },
  {
    id: 5,
    name: "Pekel Gaming PC Ultra",
    category: "Pre-build PC",
    price: 1799.99,
    image: "img/custom.jpeg",
    description: "Complete high-end gaming PC.",
    stock: 5,
    featured: true
  }
];

/**
 * PRODUCTS MANAGEMENT SECTION
 */

/**
 * Initializes the products management page
 */
function initProductsPage() {
  loadProducts();
  
  // Setup event listeners for product management
  document.getElementById('new-product')?.addEventListener('click', () => showProductForm());
  document.getElementById('cancel-product')?.addEventListener('click', hideProductForm);
  document.getElementById('product-form')?.addEventListener('submit', saveProduct);
  
  // Add reset button
  const resetBtn = document.createElement('button');
  resetBtn.innerHTML = 'Reset naar standaard producten';
  resetBtn.className = 'ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 border-transparent rounded-md shadow-sm hover:bg-red-700';
  resetBtn.addEventListener('click', resetToDefaultProducts);
  document.getElementById('new-product')?.parentNode?.appendChild(resetBtn);
}

/**
 * Loads and displays all products in the admin table
 */
function loadProducts() {
  const table = document.getElementById('products-table');
  if (!table) return;
  
  // Get products from localStorage or use defaults
  let products = JSON.parse(localStorage.getItem('products')) || DEFAULT_PRODUCTS;
  localStorage.setItem('products', JSON.stringify(products));
  
  // Display products in table
  table.innerHTML = '';
  products.forEach((product, index) => {
    const row = document.createElement('tr');
    row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="h-10 w-10 flex-shrink-0">
            <img class="h-10 w-10 rounded-full object-cover" src="../${product.image}" alt="${product.name}">
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${product.name}</div>
            <div class="text-sm text-gray-500">ID: ${product.id}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.category}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€${product.price.toFixed(2)}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 text-xs leading-5 font-semibold rounded-full ${
          parseInt(product.stock) > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }">${product.stock}</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button class="text-indigo-600 hover:text-indigo-900 edit-product mr-2" data-id="${product.id}">Bewerken</button>
        <button class="text-red-600 hover:text-red-900 delete-product" data-id="${product.id}">Verwijderen</button>
      </td>
    `;
    
    table.appendChild(row);
  });
  
  // Add event listeners to table buttons
  document.querySelectorAll('.edit-product').forEach(btn => {
    btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
  });
  
  document.querySelectorAll('.delete-product').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
  });
}

/**
 * Shows the product form for adding or editing a product
 * 
 * @param {boolean} isEditing - Whether we're editing an existing product
 */
function showProductForm(isEditing = false) {
  const form = document.getElementById('product-form-section');
  if (!form) return;
  
  form.classList.remove('hidden');
  
  const title = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-product');
  
  if (isEditing) {
    title.textContent = 'Product bewerken';
    submitBtn.textContent = 'Wijzigingen opslaan';
  } else {
    title.textContent = 'Nieuw product';
    submitBtn.textContent = 'Product toevoegen';
    
    // Clear form
    document.getElementById('product-id').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-stock').value = '';
    document.getElementById('product-description').value = '';
    document.getElementById('product-featured').checked = false;
  }
}

/**
 * Hides the product form
 */
function hideProductForm() {
  document.getElementById('product-form-section')?.classList.add('hidden');
}

/**
 * Saves a product (new or edited) to localStorage
 * 
 * @param {Event} e - Form submission event
 */
function saveProduct(e) {
  e.preventDefault();
  
  const productId = document.getElementById('product-id').value;
  const isEditing = productId !== '';

  const product = {
    id: isEditing ? parseInt(productId) : getNextProductId(),
    name: document.getElementById('product-name').value,
    category: document.getElementById('product-category').value,
    price: parseFloat(document.getElementById('product-price').value),
    stock: parseInt(document.getElementById('product-stock').value),
    description: document.getElementById('product-description').value,
    featured: document.getElementById('product-featured').checked,
    image: "img/placeholder.png" // Default image path
  };
  
  let products = JSON.parse(localStorage.getItem('products')) || [];
  
  if (isEditing) {
    const index = products.findIndex(p => p.id === parseInt(productId));
    if (index !== -1) {
      // Preserve original image when editing
      product.image = products[index].image;
      products[index] = product;
    }
  } else {
    products.push(product);
  }
  
  localStorage.setItem('products', JSON.stringify(products));
  loadProducts();
  hideProductForm();
  alert(isEditing ? 'Product bijgewerkt' : 'Product toegevoegd');
}

/**
 * Generates the next available product ID
 * 
 * @returns {number} Next available product ID
 */
function getNextProductId() {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

/**
 * Loads a product into the edit form
 * 
 * @param {number} id - Product ID to edit
 */
function editProduct(id) {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const product = products.find(p => p.id === id);
  
  if (!product) {
    alert('Product niet gevonden');
    return;
  }
  
  // Fill form with product data
  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-stock').value = product.stock;
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-featured').checked = product.featured || false;
  
  showProductForm(true);
}

/**
 * Deletes a product after confirmation
 * 
 * @param {number} id - Product ID to delete
 */
function deleteProduct(id) {
  if (confirm('Weet je zeker dat je dit product wilt verwijderen?')) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
    alert('Product verwijderd');
  }
}

/**
 * Resets products to default state after confirmation
 */
function resetToDefaultProducts() {
  if (confirm('Weet je zeker dat je alle producten wilt resetten?')) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
    loadProducts();
    alert('Producten gereset.');
  }
}

/**
 * ORDERS MANAGEMENT SECTION
 */

/**
 * Initializes the orders management page
 */
function initOrdersPage() {
  // Load orders
  const tableEl = document.getElementById('orders-table');
  if (!tableEl) return;
  
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // Display orders or show empty message
  if (orders.length === 0) {
    tableEl.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Geen bestellingen gevonden</td></tr>';
    return;
  }
  
  // Sort orders by date (newest first)
  tableEl.innerHTML = '';
  orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  orders.forEach((order, index) => {
    const row = document.createElement('tr');
    row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    
    // Format order number, date and values for display
    const orderNumber = `#${order.id.toString().substr(-6).padStart(6, '0')}`;
    const formattedDate = new Date(order.date).toLocaleDateString('nl-NL');
    const customer = order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Onbekend';
    const status = order.status || 'Nieuw';
    
    row.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-gray-900">${orderNumber}</td>
      <td class="px-6 py-4 text-sm text-gray-500">${formattedDate}</td>
      <td class="px-6 py-4 text-sm text-gray-900">${customer}</td>
      <td class="px-6 py-4 text-sm text-gray-900">€${order.total.toFixed(2)}</td>
      <td class="px-6 py-4">
        <span class="px-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}">
          ${status}
        </span>
      </td>
      <td class="px-6 py-4 text-right text-sm font-medium">
        <button class="text-indigo-600 hover:text-indigo-900 view-order" data-id="${order.id}">Details</button>
      </td>
    `;
    
    tableEl.appendChild(row);
  });
  
  // Setup order detail view buttons
  document.querySelectorAll('.view-order').forEach(btn => {
    btn.addEventListener('click', function() {
      const orderId = parseInt(this.getAttribute('data-id'));
      viewOrderDetails(orderId);
      
      // Highlight selected row
      document.querySelectorAll('#orders-table tr').forEach(row => {
        row.classList.remove('bg-indigo-50');
      });
      this.closest('tr').classList.add('bg-indigo-50');
    });
  });
  
  // Setup close details button
  document.getElementById('close-details')?.addEventListener('click', function() {
    document.getElementById('order-details-section').classList.add('hidden');
  });
}

/**
 * Returns the appropriate Tailwind CSS classes for order status colors
 * 
 * @param {string} status - Order status
 * @returns {string} Tailwind CSS classes
 */
function getStatusColor(status) {
  switch (status) {
    case 'Nieuw': return 'bg-blue-100 text-blue-800';
    case 'In behandeling': return 'bg-yellow-100 text-yellow-800';
    case 'Verzonden': return 'bg-green-100 text-green-800';
    case 'Afgeleverd': return 'bg-teal-100 text-teal-800';
    case 'Geannuleerd': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Shows order details in a modal
 * 
 * @param {number} orderId - Order ID to view
 */
function viewOrderDetails(orderId) {
  // Get order data from localStorage
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    alert('Bestelling niet gevonden');
    return;
  }
  
  // Show order details section
  const detailsSection = document.getElementById('order-details-section');
  if (detailsSection) {
    detailsSection.classList.remove('hidden');
  }
  
  // Format and display order details
  const orderNumber = `#${order.id.toString().substr(-6).padStart(6, '0')}`;
  document.getElementById('order-id').textContent = orderNumber;
  
  const orderDate = new Date(order.date).toLocaleDateString('nl-NL');
  document.getElementById('order-date').textContent = orderDate;
  
  document.getElementById('order-status').textContent = order.status || 'Nieuw';
  document.getElementById('order-total').textContent = `€${order.total.toFixed(2)}`;
  
  // Display customer information
  if (order.customer) {
    document.getElementById('customer-name').textContent = `${order.customer.firstName} ${order.customer.lastName}`;
    document.getElementById('customer-email').textContent = order.customer.email;
    document.getElementById('customer-phone').textContent = order.customer.phone || 'Niet opgegeven';
    document.getElementById('customer-address').textContent = `${order.customer.address}, ${order.customer.postalCode} ${order.customer.city}`;
  }
  
  // Display ordered items
  const itemsTable = document.getElementById('order-items');
  if (itemsTable) {
    itemsTable.innerHTML = '';
    
    order.items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          <div class="flex items-center">
            <div class="h-10 w-10 bg-gray-100 rounded">
              <img src="../${item.image}" alt="${item.name}" class="h-10 w-10 object-cover rounded">
            </div>
            <div class="ml-4">${item.name}</div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€${item.price.toFixed(2)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€${(item.price * item.quantity).toFixed(2)}</td>
      `;
      
      itemsTable.appendChild(row);
    });
  }
}