document.addEventListener("DOMContentLoaded", () => {
  const typeBtns = document.querySelectorAll(".type-btn");
  const inputName = document.getElementById("addrName");
  const inputPhone = document.getElementById("addrPhone");
  const inputDetail = document.getElementById("addrDetail");
  const btnPreviewMap = document.getElementById("btnPreviewMap");

  let currentType = "home"; // Mặc định là nhà riêng

  // 1. Đọc dữ liệu đã lưu từ LocalStorage
  const addresses = JSON.parse(localStorage.getItem("minishop_addresses") || "{}");
  const profile = JSON.parse(localStorage.getItem("minishop_profile") || "{}");

  function loadDataForType(type) {
    const data = addresses[type] || {};
    if (inputName) inputName.value = data.name || profile.fullName || "";
    if (inputPhone) inputPhone.value = data.phone || profile.phone || "";
    if (inputDetail) inputDetail.value = data.detail || (type === "home" ? profile.address || "Hà Nội" : "");

    loadGoogleMap(inputDetail ? inputDetail.value : "Hà Nội");
  }

  // 2. Xử lý click chuyển tab giữa Nhà riêng và Công ty
  typeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      typeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentType = btn.getAttribute("data-type");
      loadDataForType(currentType);
    });
  });

  // 3. Hàm Load Google Map
  function loadGoogleMap(address) {
    const iframe = document.getElementById("googleMapIframe");
    const statusText = document.getElementById("mapStatusText");
    if (!iframe) return;

    const query = address && address.trim() !== "" ? address.trim() : "Hà Nội";
    iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    if (statusText) statusText.textContent = `Đang vị trí: ${query}`;
  }

  btnPreviewMap?.addEventListener("click", () => {
    loadGoogleMap(inputDetail ? inputDetail.value : "");
    showToast("Đã cập nhật bản đồ!");
  });

  let searchTimer;
  inputDetail?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      loadGoogleMap(inputDetail.value);
    }, 600);
  });

  // 4. Lưu dữ liệu địa chỉ khi bấm submit
  const form = document.getElementById("addressForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    addresses[currentType] = {
      name: inputName.value.trim(),
      phone: inputPhone.value.trim(),
      detail: inputDetail.value.trim(),
    };

    localStorage.setItem("minishop_addresses", JSON.stringify(addresses));

    // Đồng bộ lại địa chỉ mặc định trong profile nếu là Nhà riêng
    if (currentType === "home") {
      profile.address = inputDetail.value.trim();
      localStorage.setItem("minishop_profile", JSON.stringify(profile));
    }

    showToast(`Đã lưu địa chỉ ${currentType === "home" ? "Nhà riêng" : "Công ty"} thành công!`);
  });

  // Toast Noti
  function showToast(msg) {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Khởi chạy ban đầu
  loadDataForType("home");

  // Cập nhật giỏ hàng
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    countEl.textContent = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
  }
});