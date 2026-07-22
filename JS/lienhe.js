document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  // Hiển thị thông báo lỗi
  const showError = (id, msg) => {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || "";
  };

  // Cập nhật số giỏ hàng ở Header
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
    const countEl = document.getElementById("cart-count");
    if (countEl) {
      const total = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
      countEl.textContent = total;
    }
  };

  // Tự động điền dữ liệu nếu đã đăng nhập
  const curEmail = localStorage.getItem("minishop_current");
  const profile = JSON.parse(localStorage.getItem("minishop_profile") || "{}");

  if (profile.fullName) {
    const nameInput = document.getElementById("contactName");
    if (nameInput) nameInput.value = profile.fullName;
  }
  if (curEmail) {
    const emailInput = document.getElementById("contactEmail");
    if (emailInput) emailInput.value = curEmail;
  }
  if (profile.phone) {
    const phoneInput = document.getElementById("contactPhone");
    if (phoneInput) phoneInput.value = profile.phone;
  }

  // Xử lý gửi Form
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim().toLowerCase();
    const phone = document.getElementById("contactPhone").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    let valid = true;
    showError("errName", "");
    showError("errEmail", "");
    showError("errPhone", "");
    showError("errMessage", "");

    // Validation
    if (!name || name.length < 2) {
      showError("errName", "Vui lòng nhập họ tên (ít nhất 2 ký tự).");
      valid = false;
    }

    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!email || !emailRe.test(email)) {
      showError("errEmail", "Địa chỉ email không hợp lệ.");
      valid = false;
    }

    if (phone && phone.length < 9) {
      showError("errPhone", "Số điện thoại không hợp lệ.");
      valid = false;
    }

    if (!message || message.length < 10) {
      showError("errMessage", "Vui lòng nhập nội dung tin nhắn (ít nhất 10 ký tự).");
      valid = false;
    }

    if (!valid) return;

    // Lưu phản hồi vào localStorage
    const contacts = JSON.parse(localStorage.getItem("minishop_contacts") || "[]");
    contacts.push({
      id: Date.now(),
      name,
      email,
      phone,
      message,
      date: new Date().toLocaleString("vi-VN"),
    });

    localStorage.setItem("minishop_contacts", JSON.stringify(contacts));

    alert("Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công. MiniShop sẽ phản hồi trong thời gian sớm nhất.");

    form.reset();
  });

  updateCartCount();
});