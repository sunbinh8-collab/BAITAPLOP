document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const messageEl = document.getElementById("loginMessage");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const showMessage = (msg, isError = false) => {
    if (!messageEl) return;
    messageEl.textContent = msg;
    messageEl.style.color = isError ? "#b91c1c" : "#0f766e";
    messageEl.style.display = msg ? "block" : "none";
  };

  const logoutMessage =
    new URLSearchParams(window.location.search).get("logout") === "1"
      ? "Bạn đã đăng xuất khỏi tài khoản thành công!"
      : localStorage.getItem("minishop_logout_message") || "";

  if (logoutMessage) {
    showMessage(logoutMessage);
    localStorage.removeItem("minishop_logout_message");
  }

  if (localStorage.getItem("minishop_current")) {
    window.location.href = "taikhoan.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (emailInput.value || "").trim().toLowerCase();
    const password = passwordInput.value || "";
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      showMessage("Email hoặc mật khẩu không đúng. Vui lòng thử lại.", true);
      return;
    }

    localStorage.setItem("minishop_current", user.email);
    localStorage.setItem(
      "minishop_profile",
      JSON.stringify({
        fullName: user.name || "",
        email: user.email,
        phone: "",
        address: "",
      }),
    );

    showMessage("Đăng nhập thành công. Đang chuyển tới trang tài khoản...");
    window.location.href = "taikhoan.html";
  });
});
