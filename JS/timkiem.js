function currency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function filterProducts(products, keyword, category) {
  const q = (keyword || "").trim().toLowerCase();
  let list = (products || []).slice();

  if (category && category !== "all") {
    list = list.filter((product) => product.category === category);
  }

  if (q) {
    list = list.filter((product) => {
      const haystack =
        `${product.name} ${product.desc || ""} ${product.category || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  return list;
}

function renderResults(list) {
  const container = document.getElementById("searchResults");
  const summary = document.getElementById("resultSummary");

  if (!container || !summary) return;

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML =
      '<div class="empty-state">Không tìm thấy sản phẩm phù hợp.</div>';
    summary.textContent = "Không có kết quả phù hợp.";
    return;
  }

  list.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <div class="media"><img src="${window.resolveProductImage(product.image)}" alt="${product.name}" /></div>
      <h4>${product.name}</h4>
      <div class="price">${currency(product.price)}</div>
      <div class="actions">
        <button class="btn view" data-id="${product.id}">Xem</button>
        <button class="btn add" data-id="${product.id}">Thêm vào giỏ</button>
      </div>
    `;
    container.appendChild(card);
  });

  summary.textContent = `Tìm thấy ${list.length} sản phẩm.`;
}

function applySearch(event) {
  if (event) event.preventDefault();

  const keywordInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("searchCategory");
  const keyword = keywordInput ? keywordInput.value : "";
  const category = categorySelect ? categorySelect.value : "all";
  const result = filterProducts(window.PRODUCTS || [], keyword, category);
  renderResults(result);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const countEl = document.getElementById("cart-count");
  if (countEl) {
    const total = Object.values(cart).reduce(
      (sum, item) => sum + (item.qty || 0),
      0,
    );
    countEl.textContent = total;
  }
}

document.addEventListener("click", (event) => {
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
    return;
  }

  const viewButton = event.target.closest(".view");
  if (viewButton) {
    window.location.href = "chitietsanpham.html?id=" + viewButton.dataset.id;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  if (form) form.addEventListener("submit", applySearch);

  const input = document.getElementById("searchInput");
  if (input) input.addEventListener("input", () => applySearch());

  updateCartCount();
  applySearch();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { filterProducts };
}
