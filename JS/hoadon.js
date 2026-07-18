document.addEventListener("DOMContentLoaded", function () {
  function formatVND(n) {
    return "₫" + parseInt(n).toLocaleString('vi-VN');
  }

  function updateCartCount() {
    var cart = JSON.parse(localStorage.getItem("mini_cart") || "[]");
    var count = cart.reduce(function (sum, item) { return sum + (item.qty || 0); }, 0);
    var btn = document.getElementById("headerCartBtn");
    if (btn) btn.textContent = "Giỏ (" + count + ")";
  }

  // --- BẢO VỆ TUYẾN ĐƯỜNG (KIỂM TRA ĐĂNG NHẬP) ---
  var currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser) {
    window.location.href = "dangnhap.html";
    return;
  }

  // --- ĐỒNG BỘ TRẠNG THÁI ĐĂNG NHẬP TRÊN HEADER ---
  var navLogin = document.getElementById("navLoginLink");
  var navRegister = document.getElementById("navRegisterLink");
  if (navLogin) { navLogin.textContent = currentUser.name; navLogin.href = "taikhoan.html"; }
  if (navRegister) {
    navRegister.textContent = "Đăng xuất"; navRegister.href = "#";
    navRegister.addEventListener("click", handleLogout);
  }

  function handleLogout(e) {
    if(e) e.preventDefault();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("mini_profile");
    window.location.href = "dangnhap.html";
  }
  document.getElementById("asideLogout").addEventListener("click", handleLogout);

  function getOrders() {
    var mockOrders = [
      {
        id: "2026071301",
        createdAt: "13/07/2026 21:15",
        status: "Đang xử lý",
        items: [{ title: "Áo thun Basic Unisex Nam Nữ" }, { title: "Quần Jean Slimfit Nam" }],
        paymentMethod: "cod",
        total: 498000,
        recipient: { name: currentUser.name, phone: "0912345678", address: "Số 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh" }
      },
      {
        id: "2026060502",
        createdAt: "05/06/2026 09:40",
        status: "Đã giao thành công",
        items: [{ title: "Áo sơ mi lụa nữ cổ bẻ" }],
        paymentMethod: "momo",
        total: 249000,
        recipient: { name: currentUser.name, phone: "0912345678", address: "Số 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh" }
      }
    ];

    var storedOrders = localStorage.getItem("mini_orders");
    if (!storedOrders) {
      localStorage.setItem("mini_orders", JSON.stringify(mockOrders));
      return mockOrders;
    }
    return JSON.parse(storedOrders);
  }

  function renderOrders() {
    var container = document.getElementById("ordersList");
    var orders = getOrders();

    if (!orders.length) {
      container.innerHTML = '<div class="empty-orders">Bạn chưa có đơn hàng nào tại MiniShop.</div>';
      return;
    }

    container.innerHTML = "";
    orders.forEach(function (order) {
      var itemsText = order.items
        .slice(0, 2)
        .map(function (item) { return item.title; })
        .join(", ");
      
      var extra = order.items.length > 2 ? " và hơn " + (order.items.length - 2) + " sản phẩm" : "";
      
      var paymentLabel = "Thanh toán khi nhận hàng (COD)";
      if (order.paymentMethod === "bank") paymentLabel = "Chuyển khoản ngân hàng";
      if (order.paymentMethod === "momo") paymentLabel = "Ví điện tử MoMo";
      if (order.paymentMethod === "card") paymentLabel = "Thẻ tín dụng / Thẻ ghi nợ";

      var statusClass = "status-pending";
      if (order.status === "Đang giao") statusClass = "status-shipping";
      if (order.status === "Đã giao" || order.status === "Đã giao thành công" || order.status === "Đã thanh toán") statusClass = "status-completed";
      if (order.status === "Đã hủy") statusClass = "status-cancelled";

      var orderCard = document.createElement("div");
      orderCard.className = "order-card";
      orderCard.innerHTML = `
        <div class="order-header">
          <div>
            <div class="order-id">Mã đơn: MSH-${order.id}</div>
            <div class="order-date">Ngày đặt: ${order.createdAt}</div>
          </div>
          <span class="badge-status ${statusClass}">${order.status}</span>
        </div>
        <div class="order-body">
          <div class="order-items-summary">📦 Sản phẩm: <span style="font-weight: 500; color: #57606f;">${itemsText}${extra}</span></div>
          <div class="recipient-info">
            <div><strong>Người nhận:</strong> ${order.recipient && order.recipient.name ? order.recipient.name : "Chưa cập nhật"}</div>
            <div><strong>Số điện thoại:</strong> ${order.recipient && order.recipient.phone ? order.recipient.phone : "Chưa cập nhật"}</div>
            <div><strong>Địa chỉ giao:</strong> ${order.recipient && order.recipient.address ? order.recipient.address : "Chưa cập nhật"}</div>
          </div>
        </div>
        <div class="order-footer">
          <span class="payment-method">💳 ${paymentLabel}</span>
          <div class="order-total">Tổng tiền: <span class="order-total-price">${formatVND(order.total)}</span></div>
        </div>
      `;
      container.appendChild(orderCard);
    });
  }

  updateCartCount();
  renderOrders();
});