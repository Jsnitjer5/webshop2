document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;

    // Toggle mobile menu
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });
    }
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
        name: 'AMD Ryzen 7 5800X',
        category: 'CPU',
        price: 349.99,
        image: 'img/cpu.png',
        description: '8-core, 16-thread processor voor gaming.',
        stock: 15,
        featured: true,
    },
    {
        id: 2,
        name: 'NVIDIA GeForce RTX 3080',
        category: 'GPU',
        price: 799.99,
        image: 'img/gpu.jpg',
        description: 'High-end grafische kaart met ray-tracing.',
        stock: 8,
        featured: true,
    },
    {
        id: 3,
        name: 'ASUS ROG Strix B550-F',
        category: 'Moederbord',
        price: 159.99,
        image: 'img/motherboard.jpg',
        description: 'Premium ATX moederbord.',
        stock: 12,
        featured: false,
    },
    {
        id: 4,
        name: 'Corsair Vengeance RGB Pro 32GB',
        category: 'RAM',
        price: 139.99,
        image: 'img/ram.jpg',
        description: 'High-performance DDR4 geheugen.',
        stock: 20,
        featured: false,
    },
    {
        id: 5,
        name: 'Pekel Gaming PC Ultra',
        category: 'Pre-build PC',
        price: 1799.99,
        image: 'img/custom.jpeg',
        description: 'Complete high-end gaming PC.',
        stock: 5,
        featured: true,
    },
];

/**
 * PRODUCTS MANAGEMENT
 */
function initProductsPage() {
    loadProducts();

    const newProductBtn = document.getElementById('new-product');
    const cancelProductBtn = document.getElementById('cancel-product');
    const productForm = document.getElementById('product-form');

    if (newProductBtn) {
        newProductBtn.addEventListener('click', () => showProductForm());
    }
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', hideProductForm);
    }
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }

    // Add reset button for development/testing purposes
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = 'Reset naar standaard producten';
    resetBtn.className = 'ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 ' +
        'border-transparent rounded-md shadow-sm hover:bg-red-700';
    resetBtn.addEventListener('click', resetToDefaultProducts);

    const newProductBtnParent = document.getElementById('new-product')?.parentNode;
    if (newProductBtnParent) {
        newProductBtnParent.appendChild(resetBtn);
    }
}

/**
 * Loads and displays all products in the admin table
 * Retrieves products from localStorage or uses default products
 */
function loadProducts() {
    const table = document.getElementById('products-table');
    if (!table) {
        return;
    }

    // Get products from localStorage or use defaults
    const products = JSON.parse(localStorage.getItem('products')) || DEFAULT_PRODUCTS;
    localStorage.setItem('products', JSON.stringify(products));

    // Clear existing table content
    table.innerHTML = '';

    // Display products in table
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

        const stockBadgeColor = parseInt(product.stock) > 5 ?
            'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const featuredBadgeColor = product.featured ?
            'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                        <img class="h-10 w-10 rounded-full object-cover" 
                             src="../${product.image}" alt="${product.name}">
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
                <span class="px-2 text-xs leading-5 font-semibold rounded-full ${stockBadgeColor}">
                    ${product.stock}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 text-xs leading-5 font-semibold rounded-full ${featuredBadgeColor}">
                    ${product.featured ? 'Ja' : 'Nee'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 edit-product mr-2" 
                        data-id="${product.id}">Bewerken</button>
                <button class="text-red-600 hover:text-red-900 delete-product" 
                        data-id="${product.id}">Verwijderen</button>
            </td>
        `;

        table.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
    });
}

/**
 * Shows the product form for adding or editing a product
 */
function showProductForm(isEditing = false) {
    const form = document.getElementById('product-form-section');
    if (!form) {
        return;
    }

    form.classList.remove('hidden');

    const title = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-product');

    if (isEditing) {
        if (title) {
            title.textContent = 'Product bewerken';
        }
        if (submitBtn) {
            submitBtn.textContent = 'Wijzigingen opslaan';
        }
    } else {
        if (title) {
            title.textContent = 'Nieuw product';
        }
        if (submitBtn) {
            submitBtn.textContent = 'Product toevoegen';
        }

        // Clear form fields
        const fields = [
            'product-id', 'product-name', 'product-category',
            'product-price', 'product-stock', 'product-description',
        ];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });

        const featuredCheckbox = document.getElementById('product-featured');
        if (featuredCheckbox) {
            featuredCheckbox.checked = false;
        }
    }
}

/**
 * Hides the product form
 */
function hideProductForm() {
    const formSection = document.getElementById('product-form-section');
    if (formSection) {
        formSection.classList.add('hidden');
    }
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

    // Collect form data
    const product = {
        id: isEditing ? parseInt(productId) : getNextProductId(),
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        description: document.getElementById('product-description').value,
        featured: document.getElementById('product-featured').checked,
        image: 'img/placeholder.png', // Default image path
    };

    const products = JSON.parse(localStorage.getItem('products')) || [];

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
 */
function getNextProductId() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

/**
 * Loads a product into the edit form
 */
function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);

    if (!product) {
        alert('Product niet gevonden');
        return;
    }

    // Fill form with product data
    const formFields = [
        { id: 'product-id', value: product.id },
        { id: 'product-name', value: product.name },
        { id: 'product-category', value: product.category },
        { id: 'product-price', value: product.price },
        { id: 'product-stock', value: product.stock },
        { id: 'product-description', value: product.description || '' },
    ];

    formFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            element.value = field.value;
        }
    });

    const featuredCheckbox = document.getElementById('product-featured');
    if (featuredCheckbox) {
        featuredCheckbox.checked = product.featured || false;
    }

    showProductForm(true);
}

/**
 * Deletes a product after confirmation
 */
function deleteProduct(id) {
    const userConfirmed = window.confirm('Weet je zeker dat je dit product wilt verwijderen?');
    if (userConfirmed) {
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
    const userConfirmed = window.confirm('Weet je zeker dat je alle producten wilt resetten?');
    if (userConfirmed) {
        localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
        loadProducts();
        alert('Producten gereset.');
    }
}

/**
 * ORDERS MANAGEMENT SECTION
 */
function initOrdersPage() {
    const tableEl = document.getElementById('orders-table');
    if (!tableEl) {
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Display orders or show empty message
    if (orders.length === 0) {
        tableEl.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">' +
            'Geen bestellingen gevonden</td></tr>';
        return;
    }

    // Sort orders by date (newest first)
    tableEl.innerHTML = '';
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    orders.forEach((order, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

        // Format order data for display
        const orderNumber = `#${order.id.toString().substr(-6).padStart(6, '0')}`;
        const formattedDate = new Date(order.date).toLocaleDateString('nl-NL');
        const customer = order.customer ?
            `${order.customer.firstName} ${order.customer.lastName}` : 'Onbekend';
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
                <button class="text-indigo-600 hover:text-indigo-900 view-order" 
                        data-id="${order.id}">Details</button>
            </td>
        `;

        tableEl.appendChild(row);
    });

    // Setup order detail view buttons
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function () {
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
    const closeDetailsBtn = document.getElementById('close-details');
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', function () {
            const detailsSection = document.getElementById('order-details-section');
            if (detailsSection) {
                detailsSection.classList.add('hidden');
            }
        });
    }
}

/**
 * Returns the appropriate Tailwind CSS classes for order status colors
 */
function getStatusColor(status) {
    const statusColors = {
        Nieuw: 'bg-blue-100 text-blue-800',
        'In behandeling': 'bg-yellow-100 text-yellow-800',
        Verzonden: 'bg-green-100 text-green-800',
        Afgeleverd: 'bg-teal-100 text-teal-800',
        Geannuleerd: 'bg-red-100 text-red-800',
    };

    return statusColors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Shows order details in a modal overlay
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
    const orderIdElement = document.getElementById('order-id');
    if (orderIdElement) {
        orderIdElement.textContent = orderNumber;
    }

    const orderDate = new Date(order.date).toLocaleDateString('nl-NL');
    const orderDateElement = document.getElementById('order-date');
    if (orderDateElement) {
        orderDateElement.textContent = orderDate;
    }

    const orderStatusElement = document.getElementById('order-status');
    if (orderStatusElement) {
        orderStatusElement.textContent = order.status || 'Nieuw';
    }

    const orderTotalElement = document.getElementById('order-total');
    if (orderTotalElement) {
        orderTotalElement.textContent = `€${order.total.toFixed(2)}`;
    }

    // Display customer information
    if (order.customer) {
        const customerElements = [
            {
                id: 'customer-name',
                value: `${order.customer.firstName} ${order.customer.lastName}`,
            },
            { id: 'customer-email', value: order.customer.email },
            { id: 'customer-phone', value: order.customer.phone || 'Niet opgegeven' },
            {
                id: 'customer-address',
                value: `${order.customer.address}, ${order.customer.postalCode} ${order.customer.city}`,
            },
        ];

        customerElements.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.textContent = item.value;
            }
        });
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
                            <img src="../${item.image}" alt="${item.name}" 
                                 class="h-10 w-10 object-cover rounded">
                        </div>
                        <div class="ml-4">${item.name}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    €${item.price.toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €${(item.price * item.quantity).toFixed(2)}
                </td>
            `;

            itemsTable.appendChild(row);
        });
    }
}