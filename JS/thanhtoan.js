document.addEventListener("DOMContentLoaded", () => {
  const currency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  function getImg(path) {
    if (typeof window.resolveProductImage === "function") {
      return window.resolveProductImage(path);
    }
    return path || "../images/placeholder.jpg";
  }

  // Cấu hình Ngân hàng của Shop
  const BANK_CONFIG = {
    BANK_ID: "MB",
    ACCOUNT_NO: "090123456789",
    ACCOUNT_NAME: "MINISHOP"
  };

  // 1. LẤY GIỎ HÀNG VÀ VOUCHER TỪ LOCALSTORAGE
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const cartKeys = Object.keys(cart);

  if (cartKeys.length === 0) {
    showToast("Giỏ hàng trống! Đang quay lại giỏ hàng...", "error");
    setTimeout(() => {
      window.location.href = "giohang.html";
    }, 1500);
    return;
  }

  // Tự động điền profile
  const profile = JSON.parse(localStorage.getItem("minishop_profile") || "{}");
  if (profile.fullName) document.getElementById("fullName").value = profile.fullName;
  if (profile.phone) document.getElementById("phone").value = profile.phone;
  if (profile.address) document.getElementById("address").value = profile.address;

  // 2. RENDER DỮ LIỆU SẢN PHẨM
  const itemsContainer = document.getElementById("checkoutItemsList");
  let subTotal = 0;

  if (itemsContainer) {
    itemsContainer.innerHTML = cartKeys
      .map((id) => {
        const item = cart[id];
        const itemTotal = (item.price || 0) * (item.qty || 1);
        subTotal += itemTotal;

        return `
          <div class="item-row-checkout" style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
            <img src="${getImg(item.image)}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 13px;">${item.name}</div>
              <div style="color: #64748b; font-size: 12px;">${currency(item.price)} × ${item.qty}</div>
            </div>
            <div style="font-weight: 700; font-size: 13px;">${currency(itemTotal)}</div>
          </div>`;
      })
      .join("");
  }

  // 3. TÍNH TOÁN ĐỒNG BỘ MÃ GIẢM GIÁ (Phí ship cố định 30.000đ)
  function updateTotals() {
    const shippingFee = 30000;
    const savedCoupon = JSON.parse(localStorage.getItem("minishop_coupon") || "null");
    let discountAmount = 0;

    if (savedCoupon && subTotal > 0) {
      if (savedCoupon.type === "percent" || savedCoupon.percent) {
        discountAmount = (subTotal * (savedCoupon.val || savedCoupon.percent)) / 100;
      } else if (savedCoupon.type === "amount" || savedCoupon.amount) {
        discountAmount = savedCoupon.val || savedCoupon.amount;
      }
    }

    const grandTotal = Math.max(0, subTotal - discountAmount + shippingFee);

    document.getElementById("summarySubTotal").textContent = currency(subTotal);

    const discountRow = document.getElementById("summaryDiscountRow");
    const discountEl = document.getElementById("summaryDiscount");

    if (discountRow && discountEl) {
      if (discountAmount > 0) {
        discountRow.style.display = "flex";
        discountEl.textContent = `-${currency(discountAmount)}`;
      } else {
        discountRow.style.display = "none";
      }
    }

    document.getElementById("summaryShipping").textContent = currency(shippingFee);
    document.getElementById("summaryTotal").textContent = currency(grandTotal);

    return { shippingFee, discountAmount, grandTotal, savedCoupon };
  }

  updateTotals();

  // 4. XỬ LÝ ĐỔI GIAO DIỆN PHƯƠNG THỨC THANH TOÁN & MÃ QR
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const qrBox = document.getElementById("qrCodeContainer");
  const cardBox = document.getElementById("cardDetailsContainer");
  const shopQrImage = document.getElementById("shopQrImage");

  function updateQrImage(amount) {
    if (shopQrImage) {
      const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=Thanh toan MiniShop&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;
      shopQrImage.src = qrUrl;
    }
  }

  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll(".payment-item").forEach((el) => el.classList.remove("active"));
      e.target.closest(".payment-item")?.classList.add("active");

      const val = e.target.value;
      if (val === "BANK") {
        if (qrBox) qrBox.style.display = "block";
        if (cardBox) cardBox.style.display = "none";
        const { grandTotal } = updateTotals();
        updateQrImage(grandTotal);
      } else if (val === "CARD") {
        if (qrBox) qrBox.style.display = "none";
        if (cardBox) cardBox.style.display = "block";
      } else {
        if (qrBox) qrBox.style.display = "none";
        if (cardBox) cardBox.style.display = "none";
      }
    });
  });

  // 5. XỬ LÝ LƯU THẺ NGÂN HÀNG
  const btnSaveCard = document.getElementById("btnSaveCard");
  const btnRemoveSavedCard = document.getElementById("btnRemoveSavedCard");
  const cardFormFields = document.getElementById("cardFormFields");
  const savedCardState = document.getElementById("savedCardState");
  const displayCardNumber = document.getElementById("displayCardNumber");

  function checkSavedCard() {
    const savedCard = JSON.parse(localStorage.getItem("minishop_saved_card") || "null");
    if (savedCard) {
      if (cardFormFields) cardFormFields.style.display = "none";
      if (savedCardState) savedCardState.style.display = "flex";
      if (displayCardNumber) displayCardNumber.textContent = savedCard.maskedNum;
    } else {
      if (cardFormFields) cardFormFields.style.display = "block";
      if (savedCardState) savedCardState.style.display = "none";
    }
  }

  btnSaveCard?.addEventListener("click", () => {
    const num = document.getElementById("cardNumber")?.value.trim();
    const expiry = document.getElementById("cardExpiry")?.value.trim();
    const cvv = document.getElementById("cardCvv")?.value.trim();

    if (!num || num.length < 12) {
      showToast("Vui lòng nhập số thẻ hợp lệ!", "error");
      return;
    }
    if (!expiry || !expiry.includes("/")) {
      showToast("Ngày hết hạn không đúng định dạng (MM/YY)!", "error");
      return;
    }
    if (!cvv || cvv.length < 3) {
      showToast("Mã CVV phải đủ 3 chữ số!", "error");
      return;
    }

    const maskedNum = "•••• •••• •••• " + num.slice(-4);
    localStorage.setItem("minishop_saved_card", JSON.stringify({ maskedNum, expiry }));
    showToast("Đã xác nhận & lưu thẻ thành công!");
    checkSavedCard();
  });

  btnRemoveSavedCard?.addEventListener("click", () => {
    localStorage.removeItem("minishop_saved_card");
    checkSavedCard();
  });

  checkSavedCard();

  // 6. XỬ LÝ SUBMIT ĐẶT HÀNG
  const form = document.getElementById("checkoutForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("fullName")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const note = document.getElementById("note")?.value.trim();
    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "COD";

    if (!name || !phone || !address) {
      showToast("Vui lòng điền đầy đủ các thông tin bắt buộc (*)", "error");
      return;
    }

    if (paymentMethod === "CARD") {
      const savedCard = localStorage.getItem("minishop_saved_card");
      if (!savedCard) {
        showToast("Vui lòng nhập thông tin và bấm 'Lưu & Xác nhận thẻ'!", "error");
        return;
      }
    }

    const { shippingFee, discountAmount, grandTotal, savedCoupon } = updateTotals();

    // Trừ 1 lượt sử dụng của voucher
    if (savedCoupon) {
      let usage = JSON.parse(localStorage.getItem("minishop_voucher_usage") || "{}");
      if (usage[savedCoupon.code] && usage[savedCoupon.code] > 0) {
        usage[savedCoupon.code] -= 1;
        localStorage.setItem("minishop_voucher_usage", JSON.stringify(usage));
      }
    }

    let payText = "Thanh toán khi nhận hàng (COD)";
    if (paymentMethod === "BANK") payText = "Chuyển khoản Ngân hàng (VietQR)";
    if (paymentMethod === "CARD") payText = "Thẻ Ngân hàng (ATM/Visa/Mastercard)";

    const orderData = {
      id: "#MS" + Math.floor(100000 + Math.random() * 900000),
      customerName: name,
      phone: phone,
      address: address,
      note: note,
      paymentMethod: payText,
      items: Object.values(cart),
      subTotal: subTotal,
      discountAmount: discountAmount,
      couponCode: savedCoupon ? savedCoupon.code : "",
      shippingFee: shippingFee,
      total: grandTotal,
      date: new Date().toLocaleDateString("vi-VN"),
    };

    localStorage.setItem("minishop_last_order", JSON.stringify(orderData));
    localStorage.removeItem("minishop_cart");
    localStorage.removeItem("minishop_coupon");

    showToast("Đặt hàng thành công! Đang chuyển hướng...");
    setTimeout(() => {
      window.location.href = "hoadon.html";
    }, 1200);
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
});