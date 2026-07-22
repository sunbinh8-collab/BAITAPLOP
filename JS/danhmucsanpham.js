// Định dạng VND
function currency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n || 0);
}

// Xử lý ảnh an toàn
function getImg(path) {
  if (typeof window.resolveProductImage === "function") {
    return window.resolveProductImage(path);
  }
  return path || "../images/placeholder.jpg";
}

// Render danh sách chung
function renderProductList(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (!list || !list.length) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #fff; border-radius: 16px; color: var(--muted);">
        <i class="fa-solid fa-box-open" style="font-size: 32px; margin-bottom: 8px; display: block;"></i>
        Không có sản phẩm nào phù hợp!
      </div>`;
    return;
  }

  list.forEach((p) => {
    const el = document.createElement("div");
    el.className = "product";
    el.innerHTML = `
      <div class="media"><img src="${getImg(p.image)}" alt="${p.name}"/></div>
      <h4>${p.name}</h4>
      <div class="price">${currency(p.price)}</div>
      <div class="actions">
        <button class="btn view" data-id="${p.id}"><i class="fa-regular fa-eye"></i> Xem</button>
        <button class="btn add" data-id="${p.id}"><i class="fa-solid fa-cart-plus"></i> Thêm</button>
      </div>`;
    container.appendChild(el);
  });
}

// Lọc & Sắp xếp sản phẩm
function applyFilters() {
  const catEl = document.getElementById("categorySelect");
  const filterEl = document.getElementById("filterInput");
  const sortEl = document.getElementById("sortSelect");

  const cat = catEl ? catEl.value : "all";
  const q = filterEl ? filterEl.value.trim().toLowerCase() : "";
  const sort = sortEl ? sortEl.value : "default";

  let list = (window.PRODUCTS || []).slice();

  if (cat !== "all") {
    list = list.filter((p) => p.category === cat);
  }
  if (q) {
    list = list.filter((p) => (p.name || "").toLowerCase().includes(q));
  }
  if (sort === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  }
  if (sort === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  }

  renderProductList(list, "categoryProducts");

  const cntEl = document.getElementById("productCount");
  if (cntEl) cntEl.textContent = `${list.length} sản phẩm`;
}

// Quản lý Giỏ hàng
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const count = Object.values(cart).reduce((s, it) => s + (it.qty || 0), 0);
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) cartCountEl.textContent = count;
}

function addToCart(id) {
  const prod = (window.PRODUCTS || []).find((p) => p.id == id);
  if (!prod) return;

  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  if (cart[id]) cart[id].qty += 1;
  else cart[id] = { ...prod, qty: 1 };

  localStorage.setItem("minishop_cart", JSON.stringify(cart));
  updateCartCount();
  alert(`Đã thêm "${prod.name}" vào giỏ hàng!`);
}

// Lắng nghe Click toàn trang
document.addEventListener("click", (e) => {
  const add = e.target.closest(".add");
  if (add) {
    addToCart(add.dataset.id);
    return;
  }

  const view = e.target.closest(".view");
  if (view) {
    window.location.href = "chitietsanpham.html?id=" + view.dataset.id;
    return;
  }

  // Mở giỏ hàng
  if (e.target.closest("#cartBtn")) {
    const modal = document.getElementById("cartModal");
    if (modal) modal.setAttribute("aria-hidden", "false");
  }
  if (e.target.closest("#closeCart")) {
    const modal = document.getElementById("cartModal");
    if (modal) modal.setAttribute("aria-hidden", "true");
  }
});

// Khởi tạo
document.addEventListener("DOMContentLoaded", () => {
  // Lấy tham số `?cat=nam` từ URL nếu nhảy từ Trang chủ sang
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get("cat");
  if (catParam) {
    const catSelect = document.getElementById("categorySelect");
    if (catSelect) catSelect.value = catParam;
  }

  document.getElementById("categorySelect")?.addEventListener("change", applyFilters);
  document.getElementById("sortSelect")?.addEventListener("change", applyFilters);
  document.getElementById("filterInput")?.addEventListener("input", applyFilters);

  // Render sản phẩm nổi bật & Áp dụng lọc
  renderProductList((window.PRODUCTS || []).slice(0, 3), "featuredList");
  applyFilters();
  updateCartCount();
});