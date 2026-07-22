document.addEventListener("DOMContentLoaded", () => {
  const currency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  // 1. DANH SÁCH VOUCHER HỆ THỐNG (Đã bổ sung MINI50)
  const DEFAULT_VOUCHERS = [
    { code: "MINI10", type: "percent", val: 10, desc: "Giảm 10% tổng đơn hàng" },
    { code: "MINI20", type: "percent", val: 20, desc: "Giảm 20% tổng đơn hàng" },
    { code: "MINI50", type: "percent", val: 50, desc: "Giảm 50% tổng đơn hàng" },
    { code: "XINCHAO", type: "amount", val: 50000, desc: "Ưu đãi tân thủ giảm 50.000₫" },
  ];

  // Quản lý lượt dùng từng Voucher trong LocalStorage
  function getVoucherUsage() {
    let usage = JSON.parse(localStorage.getItem("minishop_voucher_usage") || "null");
    if (!usage) {
      usage = {};
      DEFAULT_VOUCHERS.forEach((v) => {
        usage[v.code] = 10; // Khởi tạo 10 lượt mỗi mã
      });
      localStorage.setItem("minishop_voucher_usage", JSON.stringify(usage));
    }
    // Đảm bảo mã MINI50 luôn có trong bộ nhớ
    if (usage["MINI50"] === undefined) {
      usage["MINI50"] = 10;
      localStorage.setItem("minishop_voucher_usage", JSON.stringify(usage));
    }
    return usage;
  }

  const getCart = () => JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const setCart = (cart) => localStorage.setItem("minishop_cart", JSON.stringify(cart));

  // 2. RENDER DANH SÁCH VOUCHER (Giữ nguyên chữ "Dùng mã")
  function renderVoucherList() {
    const container = document.getElementById("voucherContainer");
    if (!container) return;

    const usage = getVoucherUsage();

    container.innerHTML = DEFAULT_VOUCHERS.map((v) => {
      const remaining = usage[v.code] !== undefined ? usage[v.code] : 10;
      const isDisabled = remaining <= 0;

      return `
        <div class="voucher-card">
          <div class="voucher-info">
            <div class="voucher-code-badge">
              <i class="fa-solid fa-ticket"></i> ${v.code}
            </div>
            <div class="voucher-desc">${v.desc}</div>
            <div class="voucher-uses">Còn lại: <strong>${remaining}/10</strong> lượt</div>
          </div>
          <button type="button" 
                  class="btn-use-voucher ${isDisabled ? "disabled" : ""}" 
                  data-code="${v.code}" 
                  ${isDisabled ? "disabled" : ""}>
            ${isDisabled ? "Hết lượt" : "Dùng mã"}
          </button>
        </div>
      `;
    }).join("");
  }

  // 3. RENDER SẢN PHẨM TRONG GIỎ HÀNG
  function renderCartPage() {
    const cart = getCart();
    const keys = Object.keys(cart);
    const container = document.getElementById("cartListContainer");
    const countBadge = document.getElementById("cart-count");
    const clearAllBtn = document.getElementById("clearAllCartBtn");

    const totalQty = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
    if (countBadge) countBadge.textContent = totalQty;

    if (!container) return;

    if (keys.length === 0) {
      if (clearAllBtn) clearAllBtn.style.display = "none";
      container.innerHTML = `
        <div class="empty-cart-view">
          <i class="fa-solid fa-bag-shopping"></i>
          <h3>Giỏ hàng của bạn đang trống!</h3>
          <p>Hãy thêm một số sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
          <a href="danhmucsanpham.html" class="btn primary" style="display: inline-flex; width: auto; padding: 10px 20px;">
            <i class="fa-solid fa-store"></i> Khám phá sản phẩm
          </a>
        </div>
      `;
      updateTotals(0);
      return;
    }

    if (clearAllBtn) clearAllBtn.style.display = "inline-flex";

    let subTotal = 0;
    container.innerHTML = keys
      .map((id) => {
        const item = cart[id];
        const itemTotal = (item.price || 0) * (item.qty || 1);
        subTotal += itemTotal;

        return `
        <div class="cart-item-card" data-id="${item.id}">
          <img class="cart-item-thumb" src="${item.image || '../images/placeholder.jpg'}" alt="${item.name}" />
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">${currency(item.price)}</div>
            <div class="qty-control">
              <button type="button" class="btn-minus" data-id="${item.id}">-</button>
              <span>${item.qty}</span>
              <button type="button" class="btn-plus" data-id="${item.id}">+</button>
            </div>
          </div>
          <button type="button" class="btn-remove-item" data-id="${item.id}" title="Xóa món này">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;
      })
      .join("");

    updateTotals(subTotal);
    renderVoucherList();
  }

  // 4. TÍNH TOÁN TỔNG TIỀN
  function updateTotals(subTotal) {
    const savedCoupon = JSON.parse(localStorage.getItem("minishop_coupon") || "null");
    let discount = 0;
    const shippingFee = subTotal > 0 ? 30000 : 0;

    if (savedCoupon && subTotal > 0) {
      if (savedCoupon.type === "percent" || savedCoupon.percent) {
        discount = (subTotal * (savedCoupon.val || savedCoupon.percent)) / 100;
      } else if (savedCoupon.type === "amount" || savedCoupon.amount) {
        discount = savedCoupon.val || savedCoupon.amount;
      }
    } else if (subTotal === 0) {
      localStorage.removeItem("minishop_coupon");
    }

    const finalTotal = Math.max(0, subTotal - discount + shippingFee);

    document.getElementById("subTotal").textContent = currency(subTotal);
    document.getElementById("discountVal").textContent = `-${currency(discount)}`;
    document.getElementById("shippingFee").textContent = currency(shippingFee);
    document.getElementById("finalTotal").textContent = currency(finalTotal);
  }

  // 5. HÀM ÁP DỤNG MÃ VOUCHER
  function applyCouponCode(code) {
    const usage = getVoucherUsage();
    const targetVoucher = DEFAULT_VOUCHERS.find((v) => v.code === code.toUpperCase());

    if (!targetVoucher) {
      showToast("Mã giảm giá không hợp lệ!", "error");
      return;
    }

    if ((usage[targetVoucher.code] || 0) <= 0) {
      showToast("Mã này đã hết 10 lượt sử dụng của bạn!", "error");
      return;
    }

    localStorage.setItem("minishop_coupon", JSON.stringify(targetVoucher));
    
    const inputEl = document.getElementById("couponCode");
    if (inputEl) inputEl.value = targetVoucher.code;

    renderCartPage();
    showToast(`Đã áp dụng mã ${targetVoucher.code}!`);
  }

  // Nút Áp dụng ô input
  document.getElementById("applyCouponBtn")?.addEventListener("click", () => {
    const code = document.getElementById("couponCode")?.value.trim();
    if (code) applyCouponCode(code);
    else showToast("Vui lòng nhập mã giảm giá!", "error");
  });

  // Nút Dùng mã trong danh sách
  document.getElementById("voucherContainer")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-use-voucher");
    if (btn && !btn.disabled) {
      const code = btn.getAttribute("data-code");
      if (code) applyCouponCode(code);
    }
  });

  // Tăng/Giảm/Xóa sản phẩm
  document.addEventListener("click", (e) => {
    const cart = getCart();
    const plusBtn = e.target.closest(".btn-plus");
    const minusBtn = e.target.closest(".btn-minus");
    const delBtn = e.target.closest(".btn-remove-item");
    const clearAllBtn = e.target.closest("#clearAllCartBtn");

    if (plusBtn) {
      const id = plusBtn.getAttribute("data-id");
      if (cart[id]) cart[id].qty += 1;
    } else if (minusBtn) {
      const id = minusBtn.getAttribute("data-id");
      if (cart[id]) {
        cart[id].qty -= 1;
        if (cart[id].qty <= 0) delete cart[id];
      }
    } else if (delBtn) {
      const id = delBtn.getAttribute("data-id");
      delete cart[id];
    } else if (clearAllBtn) {
      localStorage.removeItem("minishop_cart");
      localStorage.removeItem("minishop_coupon");
      renderCartPage();
      showToast("Đã xóa tất cả sản phẩm!");
      return;
    } else {
      return;
    }

    setCart(cart);
    renderCartPage();
  });

  function showToast(msg, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  renderCartPage();
});