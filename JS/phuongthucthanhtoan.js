function showToast(message) {
  var oldToast = document.querySelector(".toast-msg");
  if (oldToast) oldToast.remove();
  
  var toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.innerHTML = "✓ " + message;
  document.body.appendChild(toast);
  
  setTimeout(function () { toast.classList.add("show"); }, 50);
  setTimeout(function () { 
    toast.classList.remove("show"); 
    setTimeout(function () { toast.remove(); }, 300); 
  }, 3000);
}

function updateCartCount() {
  var cart = JSON.parse(localStorage.getItem("mini_cart") || "[]");
  var count = cart.reduce(function (sum, item) { return sum + (item.qty || 0); }, 0);
  var btn = document.getElementById("headerCartBtn");
  if (btn) btn.textContent = "Giỏ (" + count + ")";
}

// --- BẢO VỆ TUYẾN ĐƯỜNG & ĐỒNG BỘ HEADER ---
var currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
if (!currentUser) {
  window.location.href = "dangnhap.html";
} else {
  var navLogin = document.getElementById("navLoginLink");
  var navRegister = document.getElementById("navRegisterLink");
  if (navLogin) {
    navLogin.textContent = currentUser.name;
    navLogin.href = "taikhoan.html";
  }
  if (navRegister) {
    navRegister.textContent = "Đăng xuất";
    navRegister.href = "#";
    navRegister.addEventListener("click", handleLogout);
  }
}

function handleLogout(e) {
  if(e) e.preventDefault();
  localStorage.removeItem("currentUser");
  localStorage.removeItem("mini_profile");
  window.location.href = "dangnhap.html";
}
document.getElementById("asideLogout").addEventListener("click", handleLogout);

// --- QUẢN LÝ DANH SÁCH PHƯƠNG THỨC THANH TOÁN ---
var paymentListContainer = document.getElementById("paymentList");
var paymentForm = document.getElementById("paymentForm");

// Dữ liệu mẫu (Cấu hình hình ảnh lùi 1 cấp để chạy chuẩn từ thư mục html/)
var defaultMethods = [
  { id: 1, type: "bank", name: "Ngân hàng Techcombank", detail: "Số tài khoản: ****1234", icon: "../images/taikhoannganhang.jpg" }
];

var savedMethods = JSON.parse(localStorage.getItem("mini_payments")) || defaultMethods;
if (!localStorage.getItem("mini_payments")) {
  localStorage.setItem("mini_payments", JSON.stringify(savedMethods));
}

function renderPaymentMethods() {
  paymentListContainer.innerHTML = "";
  
  if (!savedMethods.length) {
    paymentListContainer.innerHTML = `
      <p style="color:var(--text-muted); font-size:0.95rem; font-style:italic;">
        Bạn chưa liên kết phương thức thanh toán nào.
      </p>`;
    return;
  }

  savedMethods.forEach(function (method) {
    var item = document.createElement("div");
    item.className = "payment-item";
    item.innerHTML = `
      <div class="method-info">
        <img src="${method.icon}" class="method-icon" alt="${method.name}">
        <div class="method-details">
          <h4>${method.name}</h4>
          <p>${method.detail}</p>
        </div>
      </div>
      <button class="btn danger-text btn-delete" data-id="${method.id}">Xóa</button>
    `;
    paymentListContainer.appendChild(item);
  });

  // Sự kiện xóa phương thức
  paymentListContainer.querySelectorAll(".btn-delete").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idToDelete = parseInt(this.getAttribute("data-id"));
      if (confirm("Bạn có chắc chắn muốn liên kết này không?")) {
        savedMethods = savedMethods.filter(function (m) { return m.id !== idToDelete; });
        localStorage.setItem("mini_payments", JSON.stringify(savedMethods));
        renderPaymentMethods();
        showToast("Đã gỡ phương thức thanh toán thành công!");
      }
    });
  });
}

// Sự kiện submit thêm tài khoản/ví mới
paymentForm.addEventListener("submit", function (e) {
  e.preventDefault();
  
  var methodType = document.getElementById("methodType").value;
  var accountName = document.getElementById("accountName").value.trim();
  var accountNumber = document.getElementById("accountNumber").value.trim();

  var iconUrl = "../images/taikhoannganhang.jpg"; // Dùng ảnh ngân hàng mặc định
  var displayDetail = "Số tài khoản: ****" + accountNumber.slice(-4);

  if (methodType === "momo") {
    iconUrl = "https://upload.wikimedia.org/wikipedia/vi/f/f0/MoMo_Logo.png"; // Link icon MoMo trực tuyến chống lỗi mất ảnh
    displayDetail = "Số điện thoại ví: " + accountNumber;
  }

  var newMethod = {
    id: Date.now(),
    type: methodType,
    name: accountName,
    detail: displayDetail,
    icon: iconUrl
  };

  savedMethods.push(newMethod);
  localStorage.setItem("mini_payments", JSON.stringify(savedMethods));
  
  paymentForm.reset();
  renderPaymentMethods();
  showToast("Thêm phương thức thanh toán thành công!");
});

// Chạy khởi tạo ban đầu
updateCartCount();
renderPaymentMethods();