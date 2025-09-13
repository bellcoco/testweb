(function () {
  const CART_KEY = 'my_cart';

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function formatVND(n) {
    return n.toLocaleString('vi-VN') + 'đ';
  }

  function renderCheckout() {
    const tbody = document.getElementById('checkout-body');
    const totalEl = document.getElementById('checkout-total');
    if (!tbody) return;

    const cart = loadCart();

    if (cart.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5">Giỏ hàng trống</td>
        </tr>`;
      if (totalEl) totalEl.textContent = formatVND(0);
      return;
    }

    let total = 0;

    tbody.innerHTML = cart.map(item => {
      const lineTotal = (item.price || 0) * (item.qty || 0);
      total += lineTotal;

      return `
        <tr>
          <th scope="row">
            <div class="d-flex align-items-center mt-2">
              <img src="${item.image}" class="img-fluid rounded-circle"
                   style="width: 90px; height: 90px;" alt="">
            </div>
          </th>
          <td class="py-5">${item.name}</td>
          <td class="py-5">${formatVND(item.price)}</td>
          <td class="py-5">${item.qty}</td>
          <td class="py-5">${formatVND(lineTotal)}</td>
        </tr>`;
    }).join('');

    if (totalEl) totalEl.textContent = formatVND(total);
  }

  document.addEventListener('DOMContentLoaded', renderCheckout);
})();
