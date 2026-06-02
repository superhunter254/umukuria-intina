const STORAGE_KEYS = {
    products: 'umukuria_products',
    cart: 'umukuria_cart',
    orders: 'umukuria_orders',
    customers: 'umukuria_customers',
    users: 'umukuria_users',
    currentUser: 'umukuria_currentUser'
};

const defaultProducts = [];

function getLocalData(key, fallback) {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Local data parse failed:', error);
        return fallback;
    }
}

function saveLocalData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getProducts() {
    let products = getLocalData(STORAGE_KEYS.products, null);
    if (!products || !Array.isArray(products) || products.length === 0) {
        products = defaultProducts;
        saveLocalData(STORAGE_KEYS.products, products);
    }
    return products;
}

function saveProducts(products) {
    saveLocalData(STORAGE_KEYS.products, products);
}

function getCart() {
    return getLocalData(STORAGE_KEYS.cart, []);
}

function saveCart(cart) {
    saveLocalData(STORAGE_KEYS.cart, cart);
}

function getOrders() {
    return getLocalData(STORAGE_KEYS.orders, []);
}

function saveOrders(orders) {
    saveLocalData(STORAGE_KEYS.orders, orders);
}

function getCustomers() {
    return getLocalData(STORAGE_KEYS.customers, []);
}

function saveCustomers(customers) {
    saveLocalData(STORAGE_KEYS.customers, customers);
}

function getUsers() {
    return getLocalData(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
    saveLocalData(STORAGE_KEYS.users, users);
}

function getCurrentUser() {
    return getLocalData(STORAGE_KEYS.currentUser, null);
}

function saveCurrentUser(user) {
    saveLocalData(STORAGE_KEYS.currentUser, user);
}

function registerUser(email, password, fullName) {
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        fullName,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    saveCurrentUser(newUser);
    return { success: true, message: 'Registration successful', user: newUser };
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
        return { success: false, message: 'Invalid email or password' };
    }
    saveCurrentUser(user);
    return { success: true, message: 'Login successful', user };
}

function logoutUser() {
    saveCurrentUser(null);
}

function formatCurrency(value) {
    return `KSh ${Number(value).toLocaleString('en-KE')}`;
}

function createStars(rating) {
    const stars = Math.round(rating || 5);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function setActiveNav() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.main-nav a').forEach((link) => {
        if (link.getAttribute('href') === path || (link.getAttribute('href') === 'index.html' && path === '')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initThemeToggle() {
    const button = document.getElementById('themeToggle');
    if (!button) return;
    button.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-mode');
    });
}

function renderFeaturedAndNew(collection, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = collection
        .slice(0, 4)
        .map((product) => {
            return `
                <article class="product-card">
                    <img src="${product.image}" alt="${product.name}" />
                    <div>
                        <h3>${product.name}</h3>
                        <p class="product-price">${formatCurrency(product.price)}</p>
                        <p class="product-rating">${createStars(product.rating)}</p>
                        <div class="card-actions">
                            <button class="btn btn-secondary" onclick="window.location.href='product.html?id=${product.id}'">View Details</button>
                            <button class="btn" onclick="addProductToCart('${product.id}', 1)">Add To Cart</button>
                        </div>
                    </div>
                </article>`;
        })
        .join('');
}

function addProductToCart(id, qty = 1) {
    const products = getProducts();
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find((item) => item.id === id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ id, quantity: qty, selectedSize: 'M' });
    }
    saveCart(cart);
    alert('Added to cart');
}

window.addProductToCart = addProductToCart;

function getCartItemCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;
    
    if (currentUser) {
        authContainer.innerHTML = `
            <span class="user-greeting">Welcome, ${currentUser.fullName}</span>
            <button class="btn btn-secondary" onclick="handleLogout()">Logout</button>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="login.html" class="btn btn-secondary">Login</a>
            <a href="register.html" class="btn btn-primary">Register</a>
        `;
    }
}

window.handleLogout = () => {
    logoutUser();
    alert('Logged out successfully');
    window.location.href = 'index.html';
};

window.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initThemeToggle();
    updateAuthUI();
    const page = document.body.dataset.page;
    if (page === 'home') {
        const products = getProducts();
        renderFeaturedAndNew(products, 'featuredProducts');
        renderFeaturedAndNew(products.slice().reverse(), 'newArrivals');
    }
});
