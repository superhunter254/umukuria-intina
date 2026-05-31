function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const count = document.getElementById('productCount');
    const noResults = document.getElementById('noResults');
    if (!grid || !count) return;
    grid.innerHTML = products
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
    count.textContent = `${products.length} product${products.length === 1 ? '' : 's'} found`;
    noResults.classList.toggle('hidden', products.length !== 0);
}

function filterProducts(products, query, category, maxPrice) {
    return products.filter((product) => {
        const matchesQuery = query
            ? product.name.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase())
            : true;
        const matchesCategory = category && category !== 'all' ? product.category === category : true;
        const matchesPrice = maxPrice ? product.price <= Number(maxPrice) : true;
        return matchesQuery && matchesCategory && matchesPrice;
    });
}

function initProductsPage() {
    const products = getProducts();
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const priceLabel = document.getElementById('priceLabel');

    const defaultCategory = getQueryParam('category');
    if (defaultCategory && categoryFilter) {
        categoryFilter.value = defaultCategory;
    }

    function applyFilters() {
        const filtered = filterProducts(products, searchInput?.value || '', categoryFilter?.value || 'all', priceFilter?.value || '6500');
        renderProducts(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (priceFilter) {
        priceFilter.addEventListener('input', () => {
            if (priceLabel) priceLabel.textContent = formatCurrency(priceFilter.value);
            applyFilters();
        });
    }
    applyFilters();
}

function initProductDetailPage() {
    const id = getQueryParam('id');
    const products = getProducts();
    const product = products.find((item) => item.id === id);
    if (!product) {
        document.getElementById('productTitle').textContent = 'Product not found';
        return;
    }

    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productRating').textContent = createStars(product.rating);
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productPrice').textContent = formatCurrency(product.price);
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailList = document.getElementById('thumbnailList');
    mainImage.src = product.image;
    mainImage.alt = product.name;

    if (thumbnailList) {
        thumbnailList.innerHTML = product.gallery
            .map((src, index) => {
                return `<button type="button" class="${index === 0 ? 'active' : ''}" onclick="selectGalleryImage('${src}', this)"><img src="${src}" alt="Gallery image ${index + 1}" /></button>`;
            })
            .join('');
    }

    document.getElementById('addToCartBtn').addEventListener('click', () => {
        const qty = Number(document.getElementById('quantityInput').value) || 1;
        addProductToCart(product.id, qty);
    });
    document.getElementById('buyNowBtn').addEventListener('click', () => {
        const qty = Number(document.getElementById('quantityInput').value) || 1;
        addProductToCart(product.id, qty);
        window.location.href = 'cart.html';
    });
}

window.selectGalleryImage = (src, button) => {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) mainImage.src = src;
    document.querySelectorAll('#thumbnailList button').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
};

window.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'products') initProductsPage();
    if (page === 'product') initProductDetailPage();
});
