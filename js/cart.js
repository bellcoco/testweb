(function () {
  const CART_KEY = 'my_cart';

  // === Helpers ===
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function formatVND(n) {
    // Giữ nguyên đơn vị của bạn trong localStorage.
    // Nếu bạn muốn hiển thị 450.000đ thì hãy lưu price = 450000.
    return n.toLocaleString('vi-VN') + 'đ';
  }

  function updateCartCountBadge() {
    const cart = loadCart();
    const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);
    const badge = document.querySelector('#cart-count');
    if (badge) badge.textContent = totalQty;
  }

  // === Render ===
  function renderCart() {
    const tbody = document.getElementById('cart-body');
    const totalEl = document.getElementById('cart-total');
    if (!tbody) return;

    const cart = loadCart();

    if (cart.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5">Giỏ hàng trống</td>
        </tr>`;
      if (totalEl) totalEl.textContent = formatVND(0);
      updateCartCountBadge();
      return;
    }

    tbody.innerHTML = cart.map((item, idx) => {
      const lineTotal = (item.price || 0) * (item.qty || 0);
      return `
        <tr data-index="${idx}">
          <th scope="row">
            <div class="d-flex align-items-center">
              <img src="${item.image || ''}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;" alt="">
            </div>
          </th>
          <td>
            <p class="mb-0 mt-4">${item.name || ''}</p>
          </td>
          <td>
            <p class="mb-0 mt-4">${formatVND(item.price || 0)}</p>
          </td>
          <td>
            <div class="input-group quantity mt-4" style="width: 120px;">
              <button class="btn btn-sm btn-minus rounded-circle bg-light border" type="button" aria-label="Giảm">
                <i class="fa fa-minus"></i>
              </button>
              <input type="text" class="form-control form-control-sm text-center border-0 cart-qty-input" value="${item.qty || 0}">
              <button class="btn btn-sm btn-plus rounded-circle bg-light border" type="button" aria-label="Tăng">
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </td>
          <td>
            <p class="mb-0 mt-4 cart-line-total">${formatVND(lineTotal)}</p>
          </td>
          <td>
            <button class="btn btn-md rounded-circle bg-light border mt-4 btn-remove" type="button" aria-label="Xóa">
              <i class="fa fa-times text-danger"></i>
            </button>
          </td>
        </tr>`;
    }).join('');

    // Cập nhật tổng
    updateTotals();
  }

  function updateTotals() {
    const totalEl = document.getElementById('cart-total');
    const cart = loadCart();
    const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
    if (totalEl) totalEl.textContent = formatVND(total);
    updateCartCountBadge();
  }

  // === Actions ===
  function changeQty(index, delta) {
    const cart = loadCart();
    const item = cart[index];
    if (!item) return;
    item.qty = Math.max(0, (item.qty || 0) + delta);

    // Nếu về 0 thì xóa khỏi cart
    if (item.qty === 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    renderCart();
  }

  function setQty(index, qty) {
    const cart = loadCart();
    const item = cart[index];
    if (!item) return;
    const val = Number(qty);
    if (Number.isFinite(val) && val >= 0) {
      if (val === 0) {
        cart.splice(index, 1);
      } else {
        item.qty = Math.floor(val);
      }
      saveCart(cart);
      renderCart();
    } else {
      // revert UI nếu nhập không hợp lệ
      renderCart();
    }
  }

  function removeItem(index) {
    const cart = loadCart();
    if (cart[index]) {
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    }
  }

  // === Event delegation ===
  function bindEvents() {
    const tbody = document.getElementById('cart-body');
    if (!tbody) return;

    tbody.addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-index]');
      if (!tr) return;
      const i = Number(tr.getAttribute('data-index'));

      if (e.target.closest('.btn-minus')) {
        changeQty(i, -1);
      } else if (e.target.closest('.btn-plus')) {
        changeQty(i, +1);
      } else if (e.target.closest('.btn-remove')) {
        removeItem(i);
      }
    });

    // Gõ số lượng trực tiếp
    tbody.addEventListener('change', (e) => {
      const input = e.target.closest('.cart-qty-input');
      if (!input) return;
      const tr = e.target.closest('tr[data-index]');
      if (!tr) return;
      const i = Number(tr.getAttribute('data-index'));
      setQty(i, input.value);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    bindEvents();

    // Nếu bạn dùng cùng hàm updateCartCount ở addtocart.js, có thể gọi lại ở đây:
    if (typeof updateCartCount === 'function') {
      updateCartCount(); // không bắt buộc, updateTotals() đã cập nhật badge
    }
  });
})();
