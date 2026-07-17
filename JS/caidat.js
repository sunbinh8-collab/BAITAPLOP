// Settings page JS: handle password form (same logic as before)
document.addEventListener("DOMContentLoaded", function () {
  const pwForm = document.getElementById("passwordForm");
  if (!pwForm) return;
  pwForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const cur = document.getElementById("curPassword").value;
    const nw = document.getElementById("newPassword").value;
    const cf = document.getElementById("confirmPassword").value;
    const stored = localStorage.getItem("minishop_password") || "";
    if (stored && cur !== stored) {
      alert("Mật khẩu hiện tại không đúng (demo)");
      return;
    }
    if (!nw || nw.length < 6) {
      alert("Mật khẩu mới phải >= 6 ký tự");
      return;
    }
    if (nw !== cf) {
      alert("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    localStorage.setItem("minishop_password", nw);
    alert("Mật khẩu đã được cập nhật (demo)");
    pwForm.reset();
  });
});
