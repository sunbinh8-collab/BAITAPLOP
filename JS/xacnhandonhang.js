document.addEventListener("DOMContentLoaded", function () {
  function formatVND(n) {
    return "₫" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function updateCartCount() {
    var cart = JSON.parse(localStorage.getItem("mini_cart") || "[]");
    var count = cart.reduce(function (sum, item) { return sum + (item.qty || 0); }, 0);
    var btn = document.getElementById("headerCartBtn");
    if (btn) btn.textContent = "Giỏ (" + count + ")";
  }

  function displayConfirmedOrder() {
    var orderMeta = JSON.parse(localStorage.getItem("mini_last_order_meta") || "null");
    var customMessage = localStorage.getItem("mini_order_message");

    if (customMessage) {
      document.getElementById("orderMessage").textContent = customMessage;
    }

    if (!orderMeta) {
      document.getElementById("orderCode").textContent = "000000";
      document.getElementById("orderAmount").textContent = "₫0";
      return;
    }

    // 1. Đồng bộ thông tin lõi hóa đơn
    document.getElementById("orderCode").textContent = orderMeta.id;
    document.getElementById("orderAmount").textContent = formatVND(orderMeta.total);
    document.getElementById("orderStatus").textContent = orderMeta.status || "Đang xử lý";
    
    var methodsText = { 
      card: "Thẻ ngân hàng liên kết", 
      bank: "Chuyển khoản ATM 24/7", 
      momo: "Ví điện tử MoMo", 
      cod: "Thanh toán khi nhận hàng (COD)" 
    };
    document.getElementById("orderPaymentMethod").textContent = methodsText[orderMeta.paymentMethod] || orderMeta.paymentMethod;

    // 2. Đồng bộ dữ liệu người mua nhận hàng
    if (orderMeta.recipient) {
      document.getElementById("customerName").textContent = orderMeta.recipient.name || "Khách hàng MiniShop";
      document.getElementById("customerPhone").textContent = orderMeta.recipient.phone || "Chưa cập nhật";
      document.getElementById("customerAddress").textContent = orderMeta.recipient.address || "Chưa cập nhật";
    }

    // 3. Render vòng lặp danh sách sản phẩm
    var itemsContainer = document.getElementById("purchasedItemsContainer");
    itemsContainer.innerHTML = "";

    if (orderMeta.items && orderMeta.items.length > 0) {
      orderMeta.items.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "purchased-item";
        row.innerHTML = `
          <div class="item-name-qty">${item.title} <span>x${item.qty}</span></div>
          <div class="item-price-total">${formatVND(item.qty * item.price)}</div>
        `;
        itemsContainer.appendChild(row);
      });
    }
  }

  // --- ĐỒNG BỘ TRẠNG THÁI ĐĂNG NHẬP TRÊN HEADER ---
  var sessionUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (sessionUser) {
    var navLogin = document.getElementById("navLoginLink");
    var navRegister = document.getElementById("navRegisterLink");
    
    if (navLogin) {
      navLogin.textContent = sessionUser.name;
      navLogin.href = "taikhoan.html";
    }
    if (navRegister) {
      navRegister.textContent = "Đăng xuất";
      navRegister.href = "#";
      navRegister.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        localStorage.removeItem("mini_profile");
        window.location.reload();
      });
    }
  }

  updateCartCount();
  displayConfirmedOrder();
});