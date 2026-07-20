document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const list = document.getElementById("customerList");

  function renderCustomers() {
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const keyword = (searchInput?.value || "").toLowerCase();

    if (!list) return;
    const filtered = users.filter((user) => {
      const text = `${user.name || ""} ${user.email || ""}`.toLowerCase();
      return text.includes(keyword);
    });

    if (!filtered.length) {
      list.innerHTML = '<div class="muted">Không có khách hàng nào.</div>';
      return;
    }

    list.innerHTML = filtered
      .map((user) => {
        const orders = user.orders || [];
        const profile = user.profile || {};
        const history = orders.length
          ? orders
              .map(
                (order) =>
                  `<li>Đơn #${order.id} • ${order.date} • ${order.total}</li>`,
              )
              .join("")
          : "<li>Chưa có lịch sử mua hàng</li>";
        const phone = profile.phone || user.phone || "Chưa cập nhật";
        const address = profile.address || user.address || "Chưa cập nhật";
        const createdAt =
          user.createdAt ||
          new Date(user.id || Date.now()).toLocaleDateString("vi-VN");
        const statusClass = user.status === "inactive" ? "inactive" : "active";
        const statusText =
          user.status === "inactive" ? "Chưa xác minh" : "Đã kích hoạt";

        return `
        <div class="customer-card">
          <div class="customer-main">
            <strong>${user.name || "Khách hàng"}</strong>
            <span>Email: ${user.email || "Chưa có email"}</span>
            <span>Điện thoại: ${phone}</span>
            <span>Địa chỉ: ${address}</span>
          </div>
          <div class="account-box">
            <strong>Thông tin tài khoản</strong>
            <span>Ngày đăng ký: ${createdAt}</span><br />
            <span>Mật khẩu: ${user.password ? "••••••" : "Chưa có"}</span><br />
            <span class="badge ${statusClass}">${statusText}</span>
            <div style="margin-top:8px">
              <strong>Lịch sử mua hàng</strong>
              <ul class="history-list">${history}</ul>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  searchInput?.addEventListener("input", renderCustomers);
  renderCustomers();
});
