document.addEventListener("DOMContentLoaded", () => {
  const currency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  function getImg(path) {
    if (typeof window.resolveProductImage === "function") {
      return window.resolveProductImage(path);
    }
    return path || "../images/placeholder.jpg";
  }

  // 1. Lấy dữ liệu tạm từ localStorage
  const lastOrderJson = localStorage.getItem("minishop_last_order");
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");

  // Nếu không có đơn hàng hoặc giỏ hàng trống -> Chuyển về giỏ hàng
  if (!lastOrderJson && Object.keys(cart).length === 0) {
    alert("Không tìm thấy thông tin đơn hàng! Vui lòng thực hiện đặt hàng lại.");
    window.location.href = "giohang.html";
    return;
  }

  const orderData = lastOrderJson ? JSON.parse(lastOrderJson) : {};

  // 2. Điền thông tin người nhận & thanh toán
  document.getElementById("confirmName").textContent = orderData.customerName || "Chưa nhập";
  document.getElementById("confirmPhone").textContent = orderData.phone || "Chưa nhập";
  document.getElementById("confirmAddress").textContent = orderData.address || "Chưa nhập";
  document.getElementById("confirmNote").textContent = orderData.note || "Không có";
  document.getElementById("confirmPayment").textContent = orderData.paymentMethod || "Thanh toán khi nhận hàng (COD)";

  // 3. Render danh sách sản phẩm
  const productsListContainer = document.getElementById("confirmProductsList");
  const items = orderData.items || Object.values(cart);
  let subTotal = 0;

  if (items.length > 0) {
    productsListContainer.innerHTML = items
      .map((it) => {
        const itemTotal = (it.price || 0) * (it.qty || 1);
        subTotal += itemTotal;
        return `
          <div class="confirm-item-row">
            <div class="confirm-item-info">
              <img src="${getImg(it.image)}" alt="${it.name}" />
              <div>
                <div class="confirm-item-title">${it.name}</div>
                <div class="confirm-item-meta">${currency(it.price)} × ${it.qty}</div>
              </div>
            </div>
            <div class="confirm-item-price">${currency(itemTotal)}</div>
          </div>`;
      })
      .join("");
  } else {
    productsListContainer.innerHTML = `<p class="muted" style="text-align:center; padding:10px 0;">Chưa có sản phẩm nào.</p>`;
  }

  // 4. Tính toán chi phí
  const shippingFee = orderData.shippingFee || 30000;
  const grandTotal = subTotal + shippingFee;

  document.getElementById("confirmSubTotal").textContent = currency(subTotal);
  document.getElementById("confirmShippingFee").textContent = currency(shippingFee);
  document.getElementById("confirmGrandTotal").textContent = currency(grandTotal);

  // 5. Sự kiện bấm nút "Xác nhận đặt hàng" -> Chuyển sang Hóa đơn
  const btnFinalPlaceOrder = document.getElementById("btnFinalPlaceOrder");
  btnFinalPlaceOrder?.addEventListener("click", () => {
    // Cập nhật lại thông tin chuẩn cho đơn hàng lần cuối
    const finalOrder = {
      id: "#MS" + Math.floor(100000 + Math.random() * 900000),
      customerName: orderData.customerName || "Khách hàng",
      phone: orderData.phone || "N/A",
      address: orderData.address || "N/A",
      note: orderData.note || "",
      paymentMethod: orderData.paymentMethod || "Thanh toán khi nhận hàng (COD)",
      shippingFee: shippingFee,
      subTotal: subTotal,
      total: grandTotal,
      items: items,
      date: new Date().toLocaleDateString("vi-VN"),
    };

    // Lưu thông tin chính thức sang minishop_last_order
    localStorage.setItem("minishop_last_order", JSON.stringify(finalOrder));

    // Chuyển hướng sang trang Hóa đơn
    window.location.href = "hoadon.html";
  });
});