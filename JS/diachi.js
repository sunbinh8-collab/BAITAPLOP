document.addEventListener("DOMContentLoaded", function () {
  function updateCartCount() {
    var cart = JSON.parse(localStorage.getItem("mini_cart") || "[]");
    var count = cart.reduce(function (sum, item) { return sum + (item.qty || 0); }, 0);
    var btn = document.getElementById("headerCartBtn");
    if (btn) btn.textContent = "Giỏ (" + count + ")";
  }

  // --- BẢO VỆ TUYẾN ĐƯỜNG (KIỂM TRA ĐĂNG NHẬP) ---
  var currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser) {
    window.location.href = "dangnhap.html";
    return;
  }

  // --- ĐỒNG BỘ TRẠNG THÁI ĐĂNG NHẬP TRÊN HEADER ---
  var navLogin = document.getElementById("navLoginLink");
  var navRegister = document.getElementById("navRegisterLink");
  
  if (navLogin) { navLogin.textContent = currentUser.name; navLogin.href = "taikhoan.html"; }
  if (navRegister) {
    navRegister.textContent = "Đăng xuất"; navRegister.href = "#";
    navRegister.addEventListener("click", handleLogout);
  }

  function handleLogout(e) {
    if(e) e.preventDefault();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("mini_profile");
    window.location.href = "dangnhap.html";
  }
  document.getElementById("asideLogout").addEventListener("click", handleLogout);

  // --- KHỞI TẠO DỮ LIỆU SỔ ĐỊA CHỈ ---
  var defaultAddresses = [
    { id: 1, name: currentUser.name, phone: "0912345678", address: "Số 85 Đường Xuân Thủy, Phường Cầu Giấy, TP. Hà Nội", isDefault: true }
  ];

  function getAddresses() {
    var stored = localStorage.getItem("mini_addresses");
    if (!stored) {
      localStorage.setItem("mini_addresses", JSON.stringify(defaultAddresses));
      return defaultAddresses;
    }
    return JSON.parse(stored);
  }

  function syncDefaultAddressToProfile(defaultItem) {
    var profile = JSON.parse(localStorage.getItem("mini_profile") || "{}");
    if(defaultItem) {
      profile.name = defaultItem.name;
      profile.phone = defaultItem.phone;
      profile.address = defaultItem.address;
      localStorage.setItem("mini_profile", JSON.stringify(profile));
    }
  }

  function setAddresses(arr) {
    localStorage.setItem("mini_addresses", JSON.stringify(arr));
    var defaultAddress = arr.find(function(i) { return i.isDefault; });
    if (defaultAddress) {
      syncDefaultAddressToProfile(defaultAddress);
    }
    renderAddresses();
  }

  function renderAddresses() {
    var container = document.getElementById("addressListContainer");
    var list = getAddresses();

    if (list.length === 0) {
      container.innerHTML = '<div class="empty-state">Sổ địa chỉ của bạn đang trống. Vui lòng thêm địa chỉ để thuận tiện cho việc mua hàng.</div>';
      return;
    }

    list.sort(function(a, b) { return b.isDefault - a.isDefault; });

    container.innerHTML = "";
    list.forEach(function (item) {
      var defaultBadge = item.isDefault ? '<br><span class="badge-default">Địa chỉ mặc định</span>' : '';
      
      var card = document.createElement("div");
      card.className = "address-card";
      card.innerHTML = `
        <div class="address-info-row">
          <span class="user-name">${item.name}</span>
          <span class="phone-num">📱 ${item.phone}</span>
        </div>
        <div class="address-detail">📍 ${item.address}</div>
        ${defaultBadge}
        <div class="address-actions">
          <button class="btn-delete-text" data-id="${item.id}">Xóa</button>
        </div>
      `;
      container.appendChild(card);
    });

    // Gắn sự kiện xóa động bảo mật
    container.querySelectorAll(".btn-delete-text").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = parseInt(this.getAttribute("data-id"));
        if (confirm("Bạn có chắc chắn muốn xóa địa chỉ nhận hàng này không?")) {
          var currentList = getAddresses();
          var itemToDelete = currentList.find(function(i) { return i.id === id; });
          
          currentList = currentList.filter(function(i) { return i.id !== id; });
          
          if (itemToDelete && itemToDelete.isDefault && currentList.length > 0) {
            currentList[0].isDefault = true;
          } else if (currentList.length === 0) {
            var profile = JSON.parse(localStorage.getItem("mini_profile") || "{}");
            profile.address = "Chưa cập nhật";
            localStorage.setItem("mini_profile", JSON.stringify(profile));
          }
          
          setAddresses(currentList);
        }
      });
    });
  }

  var modal = document.getElementById("addressModal");
  var form = document.getElementById("addressForm");

  document.getElementById("btnAddNewAddress").addEventListener("click", function() {
    modal.classList.add("active");
  });

  document.getElementById("btnCancel").addEventListener("click", function() {
    modal.classList.remove("active");
    form.reset();
  });

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var name = document.getElementById("fullName").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var address = document.getElementById("fullAddress").value.trim();
    var isDefault = document.getElementById("isDefault").checked;

    var list = getAddresses();

    if (isDefault || list.length === 0) {
      isDefault = true;
      list.forEach(function(i) { i.isDefault = false; });
    }

    var newAddress = {
      id: Date.now(),
      name: name,
      phone: phone,
      address: address,
      isDefault: isDefault
    };

    list.push(newAddress);
    setAddresses(list);
    
    modal.classList.remove("active");
    form.reset();
  });

  updateCartCount();
  renderAddresses();
});