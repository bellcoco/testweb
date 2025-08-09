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
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.querySelector('#cart-count'); // ID của span
    if (badge) {
      badge.textContent = totalQty;
    }
  }

  function addToCart(product) {
    const cart = loadCart();
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      existing.qty += 1;
    } else {
      product.qty = 1;
      cart.push(product);
    }
    saveCart(cart);
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const productBox = btn.closest('.fruite-item'); // tìm khối sản phẩm

        const name = productBox.querySelector('.product-name').textContent.trim();
        const desc = productBox.querySelector('.product-desc').textContent.trim();
        const priceText = productBox.querySelector('.product-price').textContent.trim();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')); // lọc số
        const image = productBox.querySelector('img').getAttribute('src');

        const product = { name, desc, price, image };
        addToCart(product);
      });
    });

    // Cập nhật số lượng khi load trang
    updateCartCount();
  });

})();