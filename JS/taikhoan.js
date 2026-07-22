document.addEventListener("DOMContentLoaded", () => {
  const guestView = document.getElementById("guestView");
  const userDashboard = document.getElementById("userDashboard");

  // 1. Kiểm tra đăng nhập
  const curUser = localStorage.getItem("minishop_current");

  if (!curUser) {
    if (guestView) guestView.style.display = "block";
    if (userDashboard) userDashboard.style.display = "none";
  } else {
    if (guestView) guestView.style.display = "none";
    if (userDashboard) userDashboard.style.display = "grid";

    // Lấy thông tin hồ sơ
    const profile = JSON.parse(localStorage.getItem("minishop_profile") || "{}");
    
    const accFullName = document.getElementById("accFullName");
    const accSubText = document.getElementById("accSubText");
    const inputName = document.getElementById("profileNameInput");
    const inputEmail = document.getElementById("profileEmailInput");
    const inputPhone = document.getElementById("profilePhoneInput");
    const inputAddress = document.getElementById("profileAddressInput");

    const nameVal = profile.fullName || "Thành viên MiniShop";
    const emailVal = profile.email || "";
    const phoneVal = profile.phone || curUser;
    const addressVal = profile.address || "Hà Nội, Việt Nam";

    if (accFullName) accFullName.textContent = nameVal;
    if (accSubText) accSubText.textContent = phoneVal || emailVal;

    if (inputName) inputName.value = nameVal;
    if (inputEmail) inputEmail.value = emailVal;
    if (inputPhone) inputPhone.value = phoneVal;
    if (inputAddress) inputAddress.value = addressVal;

    // Load bản đồ vị trí mặc định ban đầu
    loadGoogleMap(addressVal);
  }

  // 2. HÀM CẬP NHẬT GOOGLE MAPS THEO TỪ KHÓA
  function loadGoogleMap(address) {
    const iframe = document.getElementById("googleMapIframe");
    const statusText = document.getElementById("mapStatusText");

    if (!iframe) return;

    const query = address && address.trim() !== "" ? address.trim() : "Hà Nội";
    
    // Tự động encoded URL chuẩn định vị địa điểm
    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    
    iframe.src = mapSrc;

    if (statusText) {
      statusText.textContent = `Đang vị trí: ${query}`;
    }
  }

  // Sự kiện Click nút "Xem trên bản đồ"
  const btnPreviewMap = document.getElementById("btnPreviewMap");
  const inputAddress = document.getElementById("profileAddressInput");

  btnPreviewMap?.addEventListener("click", () => {
    const addr = inputAddress ? inputAddress.value : "";
    loadGoogleMap(addr);
    showToast("Đã định vị địa chỉ trên bản đồ!");
  });

  // Sự kiện gõ chữ vào ô địa chỉ -> Tự động cập nhật bản đồ ngay khi gõ (sử dụng debounce chống lag)
  let searchTimer;
  inputAddress?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      loadGoogleMap(inputAddress.value);
    }, 600); // Tự động load lại bản đồ sau khi ngưng gõ 0.6 giây
  });

  // 3. Xử lý Lưu Form
  const profileForm = document.getElementById("profileForm");
  profileForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputName = document.getElementById("profileNameInput")?.value.trim();
    const inputEmail = document.getElementById("profileEmailInput")?.value.trim();
    const inputPhone = document.getElementById("profilePhoneInput")?.value.trim();
    const addrVal = document.getElementById("profileAddressInput")?.value.trim();

    const updated = {
      fullName: inputName,
      email: inputEmail,
      phone: inputPhone,
      address: addrVal,
    };

    localStorage.setItem("minishop_profile", JSON.stringify(updated));

    const accFullName = document.getElementById("accFullName");
    const accSubText = document.getElementById("accSubText");
    if (accFullName) accFullName.textContent = inputName;
    if (accSubText) accSubText.textContent = inputPhone || inputEmail;

    loadGoogleMap(addrVal);
    showToast("Cập nhật thông tin hồ sơ & địa chỉ thành công!");
  });

  // 4. Toast Notification
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

  // 5. Modal Đăng xuất
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const btnCancelLogout = document.getElementById("btnCancelLogout");
  const btnConfirmLogout = document.getElementById("btnConfirmLogout");

  logoutBtn?.addEventListener("click", () => {
    if (logoutModal) logoutModal.style.display = "flex";
  });

  btnCancelLogout?.addEventListener("click", () => {
    if (logoutModal) logoutModal.style.display = "none";
  });

  logoutModal?.addEventListener("click", (e) => {
    if (e.target === logoutModal) logoutModal.style.display = "none";
  });

  btnConfirmLogout?.addEventListener("click", () => {
    localStorage.removeItem("minishop_current");
    localStorage.removeItem("minishop_profile");
    window.location.href = "dangnhap.html";
  });

  // Cập nhật số giỏ hàng
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    countEl.textContent = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
  }
});