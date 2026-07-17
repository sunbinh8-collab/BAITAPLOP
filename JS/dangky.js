document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const showError = (field, msg) => {
    const el = document.querySelector(`.error[data-for="${field}"]`);
    if (el) el.textContent = msg || "";
  };

  const validate = ({ name, email, password, password2 }) => {
    let ok = true;
    showError("name", "");
    showError("email", "");
    showError("password", "");
    showError("password2", "");
    if (!name || name.trim().length < 2) {
      showError("name", "Vui lòng nhập họ và tên.");
      ok = false;
    }
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!email || !emailRe.test(email)) {
      showError("email", "Email không hợp lệ.");
      ok = false;
    }
    if (!password || password.length < 6) {
      showError("password", "Mật khẩu phải >= 6 ký tự.");
      ok = false;
    }
    if (password !== password2) {
      showError("password2", "Mật khẩu xác nhận không khớp.");
      ok = false;
    }
    return ok;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim().toLowerCase(),
      password: document.getElementById("password").value,
      password2: document.getElementById("password2").value,
    };
    if (!validate(data)) return;

    // save user to localStorage (demo only)
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    if (users.find((u) => u.email === data.email)) {
      showError("email", "Email đã được đăng ký.");
      return;
    }
    const user = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
    };
    users.push(user);
    localStorage.setItem("minishop_users", JSON.stringify(users));

    // redirect to login
    window.location.href = "dangnhap.html";
  });
});
