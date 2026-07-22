document.addEventListener("DOMContentLoaded", function () {
  const pwForm = document.getElementById("passwordForm");
  const alertBox = document.getElementById("settingsAlert");
  const curEmail = localStorage.getItem("minishop_current") || "";

  // Hiển thị thông tin người dùng lên Sidebar
  const userProfile = JSON.parse(localStorage.getItem("minishop_profile") || "{}");
  const nameEl = document.getElementById("userDisplayName");
  const emailEl = document.getElementById("userDisplayEmail");

  if (nameEl) nameEl.textContent = userProfile.fullName || "Thành viên";
  if (emailEl) emailEl.textContent = curEmail || "Khách hàng";

  // Hàm hiển thị Alert
  const showAlert = (msg, isSuccess = false) => {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert-box ${isSuccess ? "success" : "danger"}`;
    alertBox.style.display = "block";
  };

  // Toggle Eye Password
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

  if (!pwForm) return;

  pwForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const cur = document.getElementById("curPassword").value.trim();
    const nw = document.getElementById("newPassword").value.trim();
    const cf = document.getElementById("confirmPassword").value.trim();

    // Lấy thông tin tài khoản đang đăng nhập từ danh sách users
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const userIndex = users.findIndex((u) => u.email === curEmail);

    if (userIndex !== -1) {
      if (cur !== users[userIndex].password) {
        showAlert("Mật khẩu hiện tại không chính xác!");
        return;
      }
    } else {
      // Fallback nếu tài khoản demo
      const storedDemo = localStorage.getItem("minishop_password") || "123456";
      if (cur && cur !== storedDemo) {
        showAlert("Mật khẩu hiện tại không chính xác!");
        return;
      }
    }

    if (!nw || nw.length < 6) {
      showAlert("Mật khẩu mới phải từ 6 ký tự trở lên!");
      return;
    }

    if (nw !== cf) {
      showAlert("Mật khẩu mới và Nhập lại mật khẩu không trùng khớp!");
      return;
    }

    // Cập nhật lại mật khẩu vào localStorage
    if (userIndex !== -1) {
      users[userIndex].password = nw;
      localStorage.setItem("minishop_users", JSON.stringify(users));
    }
    localStorage.setItem("minishop_password", nw);

    showAlert("Đã cập nhật mật khẩu mới thành công!", true);
    pwForm.reset();
  });
});