// --- DANH SÁCH SẢN PHẨM HOÀN CHỈNH (CÓ ĐƯỜNG DẪN ẢNH ĐƯỢC LÙI 1 CẤP ĐỂ GỌI TỪ THƯ MỤC HTML) ---
var allProducts = [
  { id: 1, title: "Áo thun Basic Unisex Nam Nữ", price: 199000, img: "../images/products/aothunden.jpg" },
  { id: 2, title: "Quần Jean Slimfit Nam", price: 299000, img: "../images/products/quanjean.jpg" },
  { id: 3, title: "Chân váy ngắn đũi nữ", price: 349000, img: "../images/products/bonuday.jpeg" },
  { id: 4, title: "Áo sơ mi lụa nữ cổ bẻ", price: 249000, img: "../images/products/somi.jpg" },
  { id: 5, title: "Mũ Beanie phong cách Hàn Quốc", price: 89000, img: "../images/products/images.jpg" },
  { id: 6, title: "Áo khoác gió Bomber Nam", price: 499000, img: "../images/products/quanaobongchuyen.jpg" },
  { id: 7, title: "Giày Sneaker Sport thể thao", price: 599000, img: "../images/products/images.jpg" },
  { id: 8, title: "Túi đeo chéo Canvas thời trang", price: 259000, img: "../images/products/bonuday.jpeg" },
  { id: 9, title: "Đồng hồ Classic Quartz", price: 1290000, img: "../images/products/quanjean.jpg" },
  { id: 10, title: "Áo Polo Nam phối cổ cá tính", price: 279000, img: "../images/products/aothunden.jpg" },
  { id: 11, title: "Quần Short Kaki Casual Nam", price: 189000, img: "../images/products/quanjean.jpg" },
  { id: 12, title: "Đầm hoa nhí dáng xòe tiểu thư nữ", price: 389000, img: "../images/products/bonuday.jpeg" },
  { id: 13, title: "Áo Hoodie nỉ ngoại Unisex", price: 350000, img: "../images/products/quanaobongchuyen.jpg" },
  { id: 14, title: "Ví da nam cầm tay cao cấp", price: 450000, img: "../images/products/images.jpg" },
  { id: 15, title: "Kính mát thời trang chống UV", price: 150000, img: "../images/products/images.jpg" },
  { id: 16, title: "Quần Tây Âu ống đứng Nam", price: 320000, img: "../images/products/quanjean.jpg" },
  { id: 17, title: "Áo Cardigan dệt kim nữ", price: 299000, img: "../images/products/somi.jpg" },
  { id: 18, title: "Tất Vớ cổ cao cotton gọn chân", price: 95000, img: "../images/products/images.jpg" },
  { id: 19, title: "Thắt lưng da khóa tự động Nam", price: 220000, img: "../images/products/quanjean.jpg" },
  { id: 20, title: "Dép quai ngang bánh mì", price: 135000, img: "../images/products/images.jpg" }
];

function formatVND(n) {
  return "₫" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

// --- BẢO VỆ TUYẾN ĐƯỜNG (ROUTING GUARD) ---
var currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
if (!currentUser) {
  window.location.href = "dangnhap.html";
}

// --- ĐỒNG BỘ ĐĂNG NHẬP HEADER ---
if (currentUser) {
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

// RENDER DANH SÁCH YÊU THÍCH ĐỘNG
function renderFavorites() {
  var favorites = JSON.parse(localStorage.getItem("mini_favorites") || "[]");
  var container = document.getElementById("favoritesList");

  if (!favorites.length) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-light); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        <p style="margin: 0; font-size: 1rem; font-weight: 600; color: var(--text-muted);">Danh sách yêu thích trống</p>
        <p style="margin: 6px 0 0 0; font-size: 0.88rem; color: var(--text-muted);">Hãy quay lại trang sản phẩm để thêm món đồ bạn thích nhé!</p>
      </div>`;
    return;
  }

  container.innerHTML = "";
  favorites.forEach(function (name) {
    var p = allProducts.find(function (x) { return x.title === name; });
    if (!p) return;

    var card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" loading="lazy" />
      <div class="product-info">
        <h3>${p.title}</h3>
        <p class="price">${formatVND(p.price)}</p>
        <div class="actions">
          <button class="btn primary add-to-cart" data-title="${p.title}">Thêm vào giỏ</button>
          <button class="btn danger-outline btn-remove" data-title="${p.title}">Bỏ yêu thích</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Xử lý Sự kiện Thêm vào giỏ hàng
  container.querySelectorAll(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var title = this.getAttribute("data-title");
      var p = allProducts.find(function (x) { return x.title === title; });
      if (!p) return;

      var cart = JSON.parse(localStorage.getItem("mini_cart") || "[]");
      var exist = cart.find(function (i) { return i.id === p.id; });
      
      if (exist) {
        exist.qty += 1;
      } else {
        cart.push({ id: p.id, title: p.title, price: p.price, qty: 1, img: p.img, size: "M", color: "Mặc định" });
      }
      
      localStorage.setItem("mini_cart", JSON.stringify(cart));
      updateCartCount();
      showToast('Đã thêm thành công "' + p.title + '" vào giỏ!');
    });
  });

  // Xử lý Sự kiện Xóa khỏi danh sách yêu thích
  container.querySelectorAll(".btn-remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var title = this.getAttribute("data-title");
      var favs = JSON.parse(localStorage.getItem("mini_favorites") || "[]");
      favs = favs.filter(function (x) { return x !== title; });
      localStorage.setItem("mini_favorites", JSON.stringify(favs));
      renderFavorites();
    });
  });
}

// Khởi chạy hệ thống khi tải xong file script
updateCartCount();
renderFavorites();