// Hàm định dạng tiền tệ VND
function currency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n || 0);
}

// Xử lý lấy ảnh sản phẩm
function getImg(path) {
  if (typeof window.resolveProductImage === "function") {
    return window.resolveProductImage(path);
  }
  return path || "../images/placeholder.jpg";
}

// Hàm Lọc và Sắp xếp danh sách sản phẩm
function filterProducts(products, keyword, category, sortBy) {
  const q = (keyword || "").trim().toLowerCase();
  let list = (products || []).slice();

  // Lọc theo danh mục
  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }

  // Lọc theo từ khóa (Tìm trong Tên, Mô tả, Category)
  if (q) {
    list = list.filter((p) => {
      const haystack = `${p.name} ${p.desc || ""} ${p.category || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  // Sắp xếp theo Giá
  if (sortBy === "asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "desc") {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
}

// Render kết quả tìm kiếm ra giao diện
function renderResults(list) {
  const container = document.getElementById("searchResults");
  const summary = document.getElementById("resultSummary");

  if (!container || !summary) return;

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h3>Không tìm thấy sản phẩm phù hợp!</h3>
        <p>Thử tìm với từ khóa khác hoặc bỏ lọc danh mục xem sao nhé.</p>
      </div>`;
    summary.textContent = "Không tìm thấy kết quả phù hợp.";
    return;
  }

  list.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <div class="media">
        <img src="${getImg(product.image)}" alt="${product.name}" />
      </div>
      <h4>${product.name}</h4>
      <div class="price">${currency(product.price)}</div>
      <div class="actions">
        <button class="btn view" data-id="${product.id}">
          <i class="fa-regular fa-eye"></i> Xem
        </button>
        <button class="btn add" data-id="${product.id}">
          <i class="fa-solid fa-cart-plus"></i> Thêm
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  summary.textContent = `Tìm thấy ${list.length} sản phẩm phù hợp.`;
}

// Thực thi Tìm kiếm
function applySearch(event) {
  if (event) event.preventDefault();

  const keywordInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("searchCategory");
  const sortSelect = document.getElementById("sortPrice");

  const keyword = keywordInput ? keywordInput.value : "";
  const category = categorySelect ? categorySelect.value : "all";
  const sortBy = sortSelect ? sortSelect.value : "default";

  const result = filterProducts(window.PRODUCTS || [], keyword, category, sortBy);
  renderResults(result);
}

// Cập nhật số lượng Giỏ hàng
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    const total = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
    countEl.textContent = total;
  }
}

// Lắng nghe click nút Thêm / Xem
document.addEventListener("click", (event) => {
  // Nút Thêm vào giỏ
  const addButton = event.target.closest(".add");
  if (addButton) {
    const id = addButton.dataset.id;
    const product = (window.PRODUCTS || []).find((item) => item.id == id);
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
    if (cart[id]) cart[id].qty += 1;
    else cart[id] = { ...product, qty: 1 };

    localStorage.setItem("minishop_cart", JSON.stringify(cart));
    updateCartCount();
    alert(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
    return;
  }

  // Nút Xem chi tiết
  const viewButton = event.target.closest(".view");
  if (viewButton) {
    window.location.href = "chitietsanpham.html?id=" + viewButton.dataset.id;
  }
});

// Khởi chạy khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const categorySelect = document.getElementById("searchCategory");
  const sortSelect = document.getElementById("sortPrice");

  // Đọc từ khóa từ URL nếu được truyền từ Trang chủ (ví dụ: timkiem.html?q=ao)
  const urlParams = new URLSearchParams(window.location.search);
  const queryParam = urlParams.get("q");
  if (queryParam && input) {
    input.value = queryParam;
  }

  // Lắng nghe sự kiện
  if (form) form.addEventListener("submit", applySearch);
  if (input) input.addEventListener("input", () => applySearch());
  if (categorySelect) categorySelect.addEventListener("change", () => applySearch());
  if (sortSelect) sortSelect.addEventListener("change", () => applySearch());

  updateCartCount();
  applySearch();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { filterProducts };
}