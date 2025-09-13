(function () {
    const CART_KEY = 'my_cart';

    function loadCart() {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    }
    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    function updateCartCount() {
        const cart = loadCart();
        const totalQty = cart.reduce((s, it) => s + it.qty, 0);
        const badge = document.querySelector('#cart-count');
        if (badge) badge.textContent = totalQty;
    }
    function addToCart(product) {
        const cart = loadCart();
        const existing = cart.find(i => i.name === product.name);
        if (existing) {
            existing.qty += product.qty || 1;
        } else {
            cart.push(product);
        }
        saveCart(cart);
        updateCartCount();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const qtyInput = document.querySelector('.quantity input');

        function getProductData() {
            const name = document.querySelector('.product-name')?.textContent.trim() || '';
            const desc = document.querySelector('.product-desc')?.textContent.trim() || '';
            const priceText = document.querySelector('.product-price')?.textContent.trim() || '0';
            const price = parseInt(priceText.replace(/\D/g, ''), 10); // ví dụ: 450.000đ -> 450000
            const image = document.querySelector('.product-image')?.getAttribute('src') || '';
            const qty = parseInt(document.querySelector('.product-qty')?.value || '1', 10);

            return { name, desc, price, image, qty };
        }


        // Nút Add to Cart
        const btnAdd = document.querySelector('.btn-add-to-cart');
        if (btnAdd) {
            btnAdd.addEventListener('click', (e) => {
                e.preventDefault();
                const product = getProductData();
                addToCart(product);
                alert(`Đã thêm ${product.name} vào giỏ hàng!`);
            });
        }

        // Nút Mua ngay
        const btnBuy = document.querySelector('.btn-buy-now');
        if (btnBuy) {
            btnBuy.addEventListener('click', (e) => {
                e.preventDefault();
                const product = getProductData();
                addToCart(product);
                window.location.href = 'checkout.html'; // chuyển sang trang checkout
            });
        }

        updateCartCount();
    });
})();
