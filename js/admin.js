function renderAdminStats() {
    const products = getProducts();
    const orders = getOrders();
    const customers = getCustomers();
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('totalRevenue').textContent = formatCurrency(revenue);
}

function renderProductList() {
    const products = getProducts();
    const container = document.getElementById('productList');
    if (!container) return;
    container.innerHTML = products
        .map((product) => {
            return `
                <div class="admin-product-item">
                    <h3>${product.name}</h3>
                    <div class="product-meta">Category: ${product.category}</div>
                    <div class="product-meta">Price: ${formatCurrency(product.price)}</div>
                    <div class="product-meta">Stock: ${product.stock}</div>
                    <div class="admin-actions">
                        <button class="btn btn-secondary" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="btn btn-secondary" onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                </div>`;
        })
        .join('');
}

function renderOrdersTable() {
    const orders = getOrders();
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;
    tbody.innerHTML = orders
        .map((order) => {
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${order.phone}</td>
                    <td>${formatCurrency(order.total)}</td>
                    <td>${order.status}</td>
                </tr>`;
        })
        .join('');
}

function renderCustomers() {
    const customers = getCustomers();
    const container = document.getElementById('customerList');
    if (!container) return;
    container.innerHTML = customers
        .map((customer) => {
            return `
                <div class="admin-customer-item">
                    <h3>${customer.name}</h3>
                    <div class="customer-meta">Phone: ${customer.phone}</div>
                    <div class="customer-meta">Orders: ${customer.orders.length}</div>
                </div>`;
        })
        .join('');
}

function updateProductImagePreview(src) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    if (!src) {
        preview.innerHTML = '<span class="image-placeholder">No image selected</span>';
        return;
    }
    preview.innerHTML = `<img src="${src}" alt="Product preview" />`;
}

function resetProductForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = 'T-Shirts';
    document.getElementById('productStock').value = '';
    document.getElementById('productImage').value = '';
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
    updateProductImagePreview(null);
}

function initProductImageUpload() {
    const fileInput = document.getElementById('productImageFile');
    const imageUrlInput = document.getElementById('productImage');
    if (!fileInput || !imageUrlInput) return;

    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            imageUrlInput.value = reader.result;
            updateProductImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    });

    imageUrlInput.addEventListener('input', () => {
        updateProductImagePreview(imageUrlInput.value.trim());
    });
}

window.editProduct = (id) => {
    const products = getProducts();
    const product = products.find((item) => item.id === id);
    if (!product) return;
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.image;
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
    updateProductImagePreview(product.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = (id) => {
    if (!confirm('Delete this product?')) return;
    const products = getProducts().filter((item) => item.id !== id);
    saveProducts(products);
    renderAdminStats();
    renderProductList();
    alert('Product deleted.');
};

function initAdminPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please login to access admin dashboard');
        window.location.href = 'login.html';
        return;
    }
    
    renderAdminStats();
    renderProductList();
    renderOrdersTable();
    renderCustomers();
    initProductImageUpload();

    const form = document.getElementById('productForm');
    const clearButton = document.getElementById('clearFormBtn');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const id = document.getElementById('productId').value || `prod-${Date.now()}`;
            const newProduct = {
                id,
                name: document.getElementById('productName').value.trim(),
                description: document.getElementById('productDescription').value.trim(),
                price: Number(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                stock: Number(document.getElementById('productStock').value),
                rating: 4.7,
                image: document.getElementById('productImage').value.trim() || 'https://via.placeholder.com/500',
                gallery: [
                    document.getElementById('productImage').value.trim() || 'https://via.placeholder.com/500'
                ]
            };

            const products = getProducts();
            const existingIndex = products.findIndex((item) => item.id === id);
            if (existingIndex > -1) {
                products[existingIndex] = newProduct;
                alert('Product updated successfully.');
            } else {
                products.unshift(newProduct);
                alert('Product added successfully.');
            }

            saveProducts(products);
            renderAdminStats();
            renderProductList();
            resetProductForm();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', resetProductForm);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'admin') initAdminPage();
});
