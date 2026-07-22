document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");
  const radioInputs = document.querySelectorAll('input[name="paymentOption"]');
  const bankDetails = document.getElementById("bankDetails");

  // Xử lý chọn phương thức thanh toán
  radioInputs.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      // Đổi class Active
      document.querySelectorAll(".payment-method").forEach((el) => el.classList.remove("active"));
      const parentLabel = e.target.closest(".payment-method");
      if (parentLabel) parentLabel.classList.add("active");

      // Hiện khung Chuyển khoản nếu chọn BANK
      if (e.target.value === "BANK") {
        if (bankDetails) bankDetails.style.display = "grid";
      } else {
        if (bankDetails) bankDetails.style.display = "none";
      }
    });
  });

  // Xử lý gửi Form hoàn tất đơn hàng
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedRadio = document.querySelector('input[name="paymentOption"]:checked');
    const selectedMethod = selectedRadio ? selectedRadio.value : "COD";

    // Lấy thông tin đơn hàng hiện tại từ localStorage
    const lastOrderJson = localStorage.getItem("minishop_last_order");
    let lastOrder = lastOrderJson ? JSON.parse(lastOrderJson) : {};

    // Gán phương thức thanh toán vừa chọn
    let methodText = "Thanh toán khi nhận hàng (COD)";
    if (selectedMethod === "BANK") methodText = "Chuyển khoản Ngân hàng (VietQR)";
    if (selectedMethod === "MOMO") methodText = "Ví điện tử MoMo / ZaloPay";

    lastOrder.paymentMethod = methodText;

    // Cập nhật lại đơn hàng vào localStorage
    localStorage.setItem("minishop_last_order", JSON.stringify(lastOrder));

    // Chuyển hướng sang trang Hóa đơn
    window.location.href = "hoadon.html";
  });
});