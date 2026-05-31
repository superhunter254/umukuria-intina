function renderCart() {
    const cartItems = getCart();
    const products = getProducts();
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotalAmount');
    const grandTotalEl = document.getElementById('grandTotalAmount');
    const deliveryAmount = 200;

    if (!container || !subtotalEl || !grandTotalEl) return;

    if (cartItems.length === 0) {
        container.innerHTML = '<div class="empty-state">Your cart is empty. Start shopping now.</div>';
        subtotalEl.textContent = formatCurrency(0);
        grandTotalEl.textContent = formatCurrency(deliveryAmount);
        return;
    }

    container.innerHTML = cartItems
        .map((item) => {
            const product = products.find((product) => product.id === item.id);
            if (!product) return '';
            const lineTotal = product.price * item.quantity;
            return `
                <div class="cart-card">
                    <img src="${product.image}" alt="${product.name}" />
                    <div class="cart-meta">
                        <h3>${product.name}</h3>
                        <div class="product-meta">${product.category} • ${formatCurrency(product.price)}</div>
                        <div class="cart-actions">
                            <input type="number" min="1" value="${item.quantity}" onchange="updateCartQuantity('${item.id}', this.value)" />
                            <button class="btn btn-secondary" onclick="removeCartItem('${item.id}')">Remove</button>
                        </div>
                        <p class="product-price">${formatCurrency(lineTotal)}</p>
                    </div>
                </div>`;
        })
        .join('');

    const subtotal = cartItems.reduce((sum, item) => {
        const product = products.find((product) => product.id === item.id);
        return product ? sum + product.price * item.quantity : sum;
    }, 0);

    subtotalEl.textContent = formatCurrency(subtotal);
    grandTotalEl.textContent = formatCurrency(subtotal + deliveryAmount);
}

window.updateCartQuantity = (id, value) => {
    const cart = getCart();
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity = Math.max(1, Number(value));
    saveCart(cart);
    renderCart();
};

window.removeCartItem = (id) => {
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
    renderCart();
};

function initCartPage() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
    renderCart();
}

function renderCheckoutSummary() {
    const cartItems = getCart();
    const products = getProducts();
    const itemsContainer = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    const deliveryEl = document.getElementById('checkoutDelivery');
    const deliveryFee = 200;
    if (!itemsContainer || !subtotalEl || !totalEl || !deliveryEl) return;

    if (cartItems.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-state">No items in your cart. Add items before checking out.</p>';
        subtotalEl.textContent = formatCurrency(0);
        deliveryEl.textContent = formatCurrency(deliveryFee);
        totalEl.textContent = formatCurrency(deliveryFee);
        return;
    }

    const subtotal = cartItems.reduce((sum, item) => {
        const product = products.find((product) => product.id === item.id);
        return product ? sum + product.price * item.quantity : sum;
    }, 0);

    itemsContainer.innerHTML = cartItems
        .map((item) => {
            const product = products.find((product) => product.id === item.id);
            if (!product) return '';
            return `<div class="summary-line"><span>${product.name} x${item.quantity}</span><span>${formatCurrency(product.price * item.quantity)}</span></div>`;
        })
        .join('');

    subtotalEl.textContent = formatCurrency(subtotal);
    deliveryEl.textContent = formatCurrency(deliveryFee);
    totalEl.textContent = formatCurrency(subtotal + deliveryFee);
}

function createOrderId() {
    const orders = getOrders();
    return `100${orders.length + 1}`;
}

function persistOrder(customer) {
    const cartItems = getCart();
    const products = getProducts();
    const deliveryFee = 200;
    const subtotal = cartItems.reduce((sum, item) => {
        const product = products.find((product) => product.id === item.id);
        return product ? sum + product.price * item.quantity : sum;
    }, 0);
    const orderId = createOrderId();
    const order = {
        id: orderId,
        customerName: customer.name,
        phone: customer.phone,
        county: customer.county,
        town: customer.town,
        address: customer.address,
        items: cartItems,
        total: subtotal + deliveryFee,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
    const customers = getCustomers();
    if (!customers.some((entry) => entry.phone === customer.phone)) {
        customers.push({ name: customer.name, phone: customer.phone, orders: [order.id] });
    } else {
        customers.forEach((entry) => {
            if (entry.phone === customer.phone) entry.orders.push(order.id);
        });
    }
    saveCustomers(customers);
    saveCart([]);
    return order;
}

function initCheckoutPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please login to proceed with checkout');
        window.location.href = 'login.html';
        return;
    }
    renderCheckoutSummary();
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const customer = {
            name: document.getElementById('customerName').value.trim(),
            phone: document.getElementById('customerPhone').value.trim(),
            county: document.getElementById('customerCounty').value.trim(),
            town: document.getElementById('customerTown').value.trim(),
            address: document.getElementById('customerAddress').value.trim()
        };

        if (!customer.name || !customer.phone || !customer.county || !customer.town) {
            alert('Please fill in all required fields.');
            return;
        }

        const order = persistOrder(customer);
        window.location.href = `orders.html?id=${order.id}`;
    });
}

function initOrderConfirmationPage() {
    const orderId = getQueryParam('id');
    const orders = getOrders();
    const order = orders.find((entry) => entry.id === orderId) || orders[orders.length - 1];
    if (!order) {
        document.getElementById('orderNumber').textContent = 'No order found';
        document.getElementById('orderItems').innerHTML = '<li>No order data available.</li>';
        return;
    }
    document.getElementById('orderNumber').textContent = `ORDER #${order.id}`;
    document.getElementById('orderCustomer').textContent = order.customerName;
    document.getElementById('orderPhone').textContent = order.phone;
    document.getElementById('orderItems').innerHTML = order.items
        .map((item) => {
            const product = getProducts().find((product) => product.id === item.id);
            const label = product ? product.name : 'Unknown Item';
            return `<li>${label} x${item.quantity}</li>`;
        })
        .join('');
    document.getElementById('orderTotal').textContent = formatCurrency(order.total);
}

window.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'cart') initCartPage();
    if (page === 'checkout') initCheckoutPage();
    if (page === 'orders') initOrderConfirmationPage();
});
