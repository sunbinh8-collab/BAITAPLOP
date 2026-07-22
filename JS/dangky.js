document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  const modal = document.getElementById("socialAuthModalReg");
  const btnCloseModal = document.getElementById("btnCloseAuthModalReg");
  const btnConfirmAuth = document.getElementById("btnConfirmSocialAuthReg");

  const authProviderIcon = document.getElementById("authProviderIconReg");
  const authModalTitle = document.getElementById("authModalTitleReg");
  const authAccName = document.getElementById("authAccNameReg");
  const authAccEmail = document.getElementById("authAccEmailReg");

  let currentProvider = "google";

  const showToast = (message, type = "success") => {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="${type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Toggle Mật khẩu
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-regular fa-eye-slash";
      } else {
        input.type = "password";
        icon.className = "fa-regular fa-eye";
      }
    });
  });

  const openAuthModal = (provider) => {
    currentProvider = provider;
    const isGoogle = provider === "google";

    if (authProviderIcon) {
      authProviderIcon.className = `auth-header-icon ${provider}`;
      authProviderIcon.innerHTML = isGoogle
        ? '<i class="fa-brands fa-google"></i>'
        : '<i class="fa-brands fa-facebook-f"></i>';
    }

    if (authModalTitle) {
      authModalTitle.textContent = isGoogle ? "Đăng ký bằng Google" : "Đăng ký bằng Facebook";
    }

    if (authAccName) {
      authAccName.textContent = isGoogle ? "Tài khoản Google (Nguyễn Văn A)" : "Tài khoản Facebook (Nguyễn Văn A)";
    }

    if (authAccEmail) {
      authAccEmail.textContent = isGoogle ? "user.google@gmail.com" : "user.facebook@facebook.com";
    }

    if (modal) modal.style.display = "flex";
  };

  btnCloseModal?.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });

  btnConfirmAuth?.addEventListener("click", () => {
    const isGoogle = currentProvider === "google";
    const userPhone = "0901234567";
    const userEmail = isGoogle ? "user.google@gmail.com" : "user.facebook@facebook.com";
    const userName = isGoogle ? "Tài khoản Google" : "Tài khoản Facebook";

    localStorage.setItem("minishop_current", userPhone);
    localStorage.setItem(
      "minishop_profile",
      JSON.stringify({
        fullName: userName,
        email: userEmail,
        phone: userPhone,
        address: "Chưa cập nhật địa chỉ",
      })
    );

    if (modal) modal.style.display = "none";
    showToast(`Tạo tài khoản thành công qua ${isGoogle ? "Google" : "Facebook"}!`);

    setTimeout(() => {
      window.location.href = "taikhoan.html";
    }, 1200);
  });

  document.getElementById("btnGoogleRegister")?.addEventListener("click", () => openAuthModal("google"));
  document.getElementById("btnFBRegister")?.addEventListener("click", () => openAuthModal("facebook"));

  // Form Đăng ký
  const showError = (field, msg) => {
    const el = document.querySelector(`.error[data-for="${field}"]`);
    if (el) el.textContent = msg || "";
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let valid = true;
    showError("name", ""); showError("phone", ""); showError("password", ""); showError("confirmPassword", "");

    if (!name) { showError("name", "Vui lòng nhập họ tên"); valid = false; }
    if (!phone || phone.length < 9) { showError("phone", "Số điện thoại không hợp lệ"); valid = false; }
    if (password.length < 6) { showError("password", "Mật khẩu tối thiểu 6 ký tự"); valid = false; }
    if (password !== confirmPassword) { showError("confirmPassword", "Mật khẩu không trùng khớp"); valid = false; }

    if (!valid) return;

    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    if (users.some((u) => u.phone === phone)) {
      showError("phone", "Số điện thoại này đã được đăng ký trước đó!");
      return;
    }

    users.push({ id: Date.now(), name, phone, password });
    localStorage.setItem("minishop_users", JSON.stringify(users));

    showToast("Đăng ký tài khoản thành công! Đang chuyển hướng...");
    setTimeout(() => {
      window.location.href = "dangnhap.html";
    }, 1200);
  });
});