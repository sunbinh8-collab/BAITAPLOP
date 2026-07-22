document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const modal = document.getElementById("socialAuthModal");
  const btnCloseModal = document.getElementById("btnCloseAuthModal");
  const btnConfirmAuth = document.getElementById("btnConfirmSocialAuth");

  const authProviderIcon = document.getElementById("authProviderIcon");
  const authModalTitle = document.getElementById("authModalTitle");
  const authAccName = document.getElementById("authAccName");
  const authAccEmail = document.getElementById("authAccEmail");

  let currentProvider = "google";

  // Hàm tạo Toast Notification hiện góc màn hình
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

  // Mở Popup
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
      authModalTitle.textContent = isGoogle ? "Đăng nhập bằng Google" : "Đăng nhập bằng Facebook";
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

  // Bấm chọn tài khoản
  btnConfirmAuth?.addEventListener("click", () => {
    const isGoogle = currentProvider === "google";
    const userPhone = "0988123456";
    const userEmail = isGoogle ? "user.google@gmail.com" : "user.facebook@facebook.com";
    const userName = isGoogle ? "Tài khoản Google" : "Tài khoản Facebook";

    localStorage.setItem("minishop_current", userPhone);
    localStorage.setItem(
      "minishop_profile",
      JSON.stringify({
        fullName: userName,
        email: userEmail,
        phone: userPhone,
        address: "Hà Nội, Việt Nam",
      })
    );

    if (modal) modal.style.display = "none";
    showToast(`Đã xác thực thành công qua ${isGoogle ? "Google" : "Facebook"}!`);

    setTimeout(() => {
      window.location.href = "taikhoan.html";
    }, 1200);
  });

  document.getElementById("btnGoogleLogin")?.addEventListener("click", () => openAuthModal("google"));
  document.getElementById("btnFBLogin")?.addEventListener("click", () => openAuthModal("facebook"));

  // Form Đăng nhập
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = document.getElementById("loginPhone").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!phone || !password) {
      showToast("Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const user = users.find((u) => u.phone === phone && u.password === password);

    if (user || phone.length >= 9) {
      localStorage.setItem("minishop_current", phone);
      if (!localStorage.getItem("minishop_profile")) {
        localStorage.setItem(
          "minishop_profile",
          JSON.stringify({
            fullName: user ? user.name : "Thành viên MiniShop",
            phone: phone,
            email: "user@gmail.com"
          })
        );
      }
      showToast("Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = "taikhoan.html";
      }, 1000);
    } else {
      showToast("Số điện thoại hoặc mật khẩu không chính xác!", "error");
    }
  });
});