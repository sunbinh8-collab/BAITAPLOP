document.addEventListener("DOMContentLoaded", () => {
  // Định dạng tiền tệ VND
  const currency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  // Lấy dữ liệu đơn hàng vừa đặt từ localStorage
  const lastOrderJson = localStorage.getItem("minishop_last_order");

  if (!lastOrderJson) {
    // Nếu không có dữ liệu đơn hàng gần nhất (truy cập trực tiếp)
    document.getElementById("invOrderId").textContent = "#" + Math.floor(100000 + Math.random() * 900000);
    document.getElementById("invCustomerName").textContent = "Khách mua hàng";
    document.getElementById("invCustomerPhone").textContent = "Chưa cập nhật";
    document.getElementById("invCustomerAddress").textContent = "Chưa cập nhật";
    document.getElementById("invPaymentMethod").textContent = "Thanh toán khi nhận hàng (COD)";
    document.getElementById("invOrderDate").textContent = new Date().toLocaleDateString("vi-VN");
    
    document.getElementById("invItemsList").innerHTML = `
      <div class="item-row">
        <span class="item-name">Sản phẩm mẫu demo</span>
        <span class="item-qty">x1</span>
        <span class="item-price">500.000₫</span>
      </div>`;
    
    document.getElementById("invSubTotal").textContent = currency(500000);
    document.getElementById("invTotal").textContent = currency(530000);
    return;
  }

  // Giải mã dữ liệu đơn hàng
  const order = JSON.parse(lastOrderJson);

  // Điền dữ liệu lên hóa đơn
  document.getElementById("invOrderId").textContent = order.id || ("#" + Date.now().toString().slice(-6));
  document.getElementById("invCustomerName").textContent = order.customerName || "Khách hàng";
  document.getElementById("invCustomerPhone").textContent = order.phone || "N/A";
  document.getElementById("invCustomerAddress").textContent = order.address || "N/A";
  document.getElementById("invPaymentMethod").textContent = order.paymentMethod || "Thanh toán khi nhận hàng (COD)";
  document.getElementById("invOrderDate").textContent = order.date || new Date().toLocaleDateString("vi-VN");

  // Render danh sách sản phẩm đã chọn
  const itemsContainer = document.getElementById("invItemsList");
  let subTotal = 0;

  if (order.items && order.items.length > 0) {
    itemsContainer.innerHTML = order.items
      .map((it) => {
        const itemTotal = (it.price || 0) * (it.qty || 1);
        subTotal += itemTotal;
        return `
          <div class="item-row">
            <div>
              <span class="item-name">${it.name}</span>
              <span class="item-qty"> (x${it.qty})</span>
            </div>
            <span class="item-price">${currency(itemTotal)}</span>
          </div>`;
      })
      .join("");
  } else {
    itemsContainer.innerHTML = `<p class="muted-sm">Không có dữ liệu chi tiết sản phẩm.</p>`;
  }

  const shippingFee = order.shippingFee !== undefined ? order.shippingFee : 30000;
  const grandTotal = order.total || (subTotal + shippingFee);

  document.getElementById("invSubTotal").textContent = currency(subTotal);
  document.getElementById("invShippingFee").textContent = currency(shippingFee);
  document.getElementById("invTotal").textContent = currency(grandTotal);

  // Xóa sạch giỏ hàng sau khi đặt thành công
  localStorage.removeItem("minishop_cart");
});