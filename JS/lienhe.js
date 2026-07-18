document.addEventListener("DOMContentLoaded", function () {
  function showToast(message) {
    var oldToast = document.querySelector(".toast-msg");
    if (oldToast) oldToast.remove();

    var toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.innerHTML = '<span class="toast-icon">✓</span> ' + message;
    document.body.appendChild(toast);

    setTimeout(function () { toast.classList.add("show"); }, 50);

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  function updateCartCount() {
    var cart = JSON.parse(localStorage.getItem("mini_cart") || "[]");
    var count = cart.reduce(function (sum, item) {
      return sum + (item.qty || 0);
    }, 0);
    var btn = document.getElementById("headerCartBtn");
    if (btn) btn.textContent = "Giỏ (" + count + ")";
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

    // Tự động điền thông tin người dùng vào Form nếu đã đăng nhập
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    if (nameInput) nameInput.value = sessionUser.name || "";
    if (emailInput) emailInput.value = sessionUser.email || "";
  }

  // Xử lý sự kiện gửi liên hệ
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showToast("Tin nhắn của bạn đã được gửi thành công. MiniShop sẽ phản hồi sớm nhất!");
      this.reset();
      
      // Giữ lại thông tin định danh sau khi reset nếu đang đăng nhập
      if (sessionUser) {
        if (nameInput) nameInput.value = sessionUser.name || "";
        if (emailInput) emailInput.value = sessionUser.email || "";
      }
    });
  }

  // Khởi chạy tính toán ban đầu
  updateCartCount();
});