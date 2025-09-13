(function () {
  const CART_KEY = 'my_cart';
  const WEBHOOK_URL = 'https://n8n.daolq.click/webhook/web-cpl';

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function calcTotals(cart) {
    const total_qty = cart.reduce((s, it) => s + (it.qty || 0), 0);
    const subtotal  = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
    // Nếu có phí ship cố định, chỉnh ở đây:
    const shipping  = 0; // 30000 chẳng hạn
    const grand_total = subtotal + shipping;
    return { total_qty, subtotal, shipping, grand_total };
  }

  function sanitizePhone(v) {
    return String(v || '').replace(/[^\d+]/g, '').trim();
  }

  async function submitOrder() {
    const btn = document.getElementById('btn-place-order');
    if (!btn) return;

    const nameEl    = document.getElementById('cust-name');
    const phoneEl   = document.getElementById('cust-phone');
    const addrEl    = document.getElementById('cust-address');
    const noteEl    = document.getElementById('cust-note');
    // const confirmEl = document.getElementById('Account-1');

    const full_name = nameEl?.value.trim();
    const phone     = sanitizePhone(phoneEl?.value);
    const address   = addrEl?.value.trim();
    const note      = noteEl?.value.trim() || '';
    // const confirm_call = !!confirmEl?.checked;

    // Validate tối thiểu
    if (!full_name || !phone || !address) {
      alert('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ.');
      return;
    }
    // Optional: rule basic cho số điện thoại VN
    if (!/^\+?\d{9,13}$/.test(phone)) {
      if (!confirm('Số điện thoại có vẻ chưa đúng định dạng. Bạn vẫn muốn tiếp tục?')) {
        return;
      }
    }

    const cart = loadCart();
    if (!Array.isArray(cart) || cart.length === 0) {
      alert('Giỏ hàng đang trống.');
      return;
    }

    // Chuẩn bị payload
    const items = cart.map(it => ({
      name: it.name,
      desc: it.desc,
      image: it.image,
      price: it.price,              // VND integer (vd 450000)
      qty: it.qty,
      line_total: (it.price || 0) * (it.qty || 0)
    }));
    const totals = calcTotals(cart);

    const payload = {
      customer: {
        full_name,
        phone,
        address,
        note
        // confirm_call
      },
      cart: items,
      totals: {
        currency: 'VND',
        total_qty: totals.total_qty,
        subtotal: totals.subtotal,
        // shipping: totals.shipping,
        grand_total: totals.grand_total
      },
      meta: {
        source: location.hostname,
        path: location.pathname,
        created_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      }
    };

    // Gửi đi
    try {
      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = 'Đang gửi...';

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Nếu AnyCross cần raw body hoặc header khác, chỉnh tại đây
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Có thể là lỗi CORS / 4xx / 5xx
        const text = await res.text().catch(() => '');
        throw new Error(`Request failed: ${res.status} ${text}`);
      }

      // ✅ Thành công: xóa giỏ + chuyển trang cảm ơn
      localStorage.removeItem(CART_KEY);
      alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận.');
      // Điều hướng tới trang cảm ơn (tùy bạn)
      window.location.href = 'index.html';

    } catch (err) {
      console.error(err);
      alert('Gửi đơn thất bại. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Đặt hàng';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-place-order');
    if (btn) btn.addEventListener('click', submitOrder);
  });
})();
