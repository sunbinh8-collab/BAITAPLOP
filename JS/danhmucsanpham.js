function currency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function renderCategoryProducts(list) {
  const container = document.getElementById("categoryProducts");
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML =
      '<div style="padding:20px;background:#fff;border-radius:12px">Không có sản phẩm</div>';
    return;
  }
  list.forEach((p) => {
    const el = document.createElement("div");
    el.className = "product";
    el.innerHTML = `
      <div class="media"><img src="${p.image}" alt="${p.name}"/></div>
      <h4>${p.name}</h4>
      <div class="price">${currency(p.price)}</div>
      <div class="actions">
        <button class="btn view" data-id="${p.id}">Xem</button>
        <button class="btn add" data-id="${p.id}">Thêm vào giỏ</button>
      </div>`;
    container.appendChild(el);
  });
}

function renderFeatured(list, count = 3) {
  const root = document.getElementById("featuredList");
  if (!root) return;
  const items = (list || []).slice(0, count);
  root.innerHTML = "";
  if (!items.length) {
    root.innerHTML =
      '<div style="padding:20px;background:#fff;border-radius:12px" class="muted">Không có sản phẩm nổi bật.</div>';
    console.log(
      "danhmucsanpham: PRODUCTS length=",
      (window.PRODUCTS || []).length,
    );
    return;
  }

  items.forEach((p) => {
    const el = document.createElement("div");
    el.className = "product";
    el.innerHTML = `
      <div class="media"><img src="${p.image}" alt="${p.name}"/></div>
      <h4>${p.name}</h4>
      <div class="price">${currency(p.price)}</div>
      <div class="actions">
        <button class="btn view" data-id="${p.id}">Xem</button>
        <button class="btn add" data-id="${p.id}">Thêm vào giỏ</button>
      </div>`;
    root.appendChild(el);
  });
}

function applyFilters() {
  const cat = document.getElementById("categorySelect").value;
  const q = document.getElementById("filterInput").value.trim().toLowerCase();
  const sort = document.getElementById("sortSelect").value;
  let list = (window.PRODUCTS || []).slice();
  if (cat !== "all") list = list.filter((p) => p.category === cat);
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  renderCategoryProducts(list);
  // update count display if present
  const cntEl = document.getElementById("productCount");
  if (cntEl) cntEl.textContent = `${list.length} sản phẩm`;
}

document.addEventListener("click", (e) => {
  const add = e.target.closest(".add");
  if (add) {
    const id = add.dataset.id;
    const prod = (window.PRODUCTS || []).find((p) => p.id == id);
    if (!prod) return;
    const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
    if (cart[id]) cart[id].qty += 1;
    else cart[id] = { ...prod, qty: 1 };
    localStorage.setItem("minishop_cart", JSON.stringify(cart));
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
      cartCountEl.textContent = Object.values(cart).reduce(
        (s, it) => s + it.qty,
        0,
      );
    }
    return;
  }
  const view = e.target.closest(".view");
  if (view) {
    window.location.href = "chitietsanpham.html?id=" + view.dataset.id;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("categorySelect")
    .addEventListener("change", applyFilters);
  document
    .getElementById("sortSelect")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filterInput")
    .addEventListener("input", applyFilters);
  // render featured first then full list
  renderFeatured(window.PRODUCTS || [], 3);
  applyFilters();
});
