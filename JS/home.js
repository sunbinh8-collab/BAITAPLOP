const PRODUCTS = window.PRODUCTS || window.PRODUCTS_DATA || [];

const currency = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

const getImageUrl = (imagePath) => {
  if (typeof window.resolveProductImage === "function") {
    return window.resolveProductImage(imagePath);
  }
  return imagePath || "images/placeholder.jpg";
};

/* ==========================================================================
   1. QUẢN LÝ LOCALSTORAGE (GIỎ HÀNG & YÊU THÍCH)
   ========================================================================== */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem("minishop_cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = Object.values(cart).reduce((s, it) => s + (it.qty || 0), 0);
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    cartCountEl.textContent = count;
  }
}

function addToCart(id) {
  const productList = window.PRODUCTS || window.PRODUCTS_DATA || [];
  const product = productList.find((p) => String(p.id) === String(id));
  if (!product) return;

  const cart = getCart();
  if (cart[id]) {
    cart[id].qty += 1;
  } else {
    cart[id] = { ...product, qty: 1 };
  }

  saveCart(cart);
  updateCartCount();
  showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

// Lấy & Lưu Danh sách Yêu thích
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem("minishop_wishlist") || "[]").map(String);
  } catch (e) {
    return [];
  }
}

function toggleWishlist(id) {
    let list = getWishlist().map(String);
    const sId = String(id);
    let added = false;

    if (list.includes(sId)) {
      list = list.filter((i) => i !== sId);
    } else {
      list.push(sId);
      added = true;
    }

    localStorage.setItem("minishop_wishlist", JSON.stringify(list));
    renderProducts();
    
    // Gọi Toast xịn xò
    showToast(
      added ? "Đã thêm vào danh sách yêu thích!" : "Đã bỏ khỏi danh sách yêu thích",
      added ? "wishlist-add" : "wishlist-remove"
    );
}  

/* ==========================================================================
   2. RENDER GIAO DIỆN SẢN PHẨM & GIỎ HÀNG
   ========================================================================== */
function renderProducts(list = (window.PRODUCTS || window.PRODUCTS_DATA || [])) {
  const container = document.getElementById("products") || document.getElementById("featuredProducts") || document.querySelector(".product-grid");
  if (!container) return;

  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
        Không tìm thấy sản phẩm nào phù hợp!
      </div>`;
    return;
  }

  const wishlist = getWishlist();

  list.forEach((p) => {
    const isFav = wishlist.includes(String(p.id));
    const el = document.createElement("div");
    el.className = "product-card";
    el.innerHTML = `
      <div class="product-thumb-wrap" style="position: relative;">
        <img class="product-thumb" src="${getImageUrl(p.image)}" alt="${p.name}" loading="lazy"/>
        
        <!-- NÚT TIM YÊU THÍCH ĐÃ ĐƯỢC TÍCH HỢP -->
        <button class="btn-wishlist ${isFav ? 'active' : ''}" data-fav="${p.id}" title="Yêu thích">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>

      <div class="product-info">
        <h3 class="product-title">${p.name}</h3>
        <div class="product-price-row">
          <span class="product-price">${currency(p.price)}</span>
        </div>

        <div class="product-actions-row" style="display: flex; gap: 8px; margin-top: auto;">
          <button class="btn view" data-id="${p.id}" style="flex:1; background:#f1f5f9; color:#334155; border:none; padding:10px; border-radius:10px; font-weight:700; cursor:pointer;">
            <i class="fa-regular fa-eye"></i> Xem
          </button>
          <button class="btn add" data-id="${p.id}" style="flex:1; background:#2563eb; color:#ffffff; border:none; padding:10px; border-radius:10px; font-weight:700; cursor:pointer;">
            <i class="fa-solid fa-cart-plus"></i> Thêm
          </button>
        </div>
      </div>`;
    container.appendChild(el);
  });
}

function renderCart() {
  const cart = getCart();
  const itemsContainer = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");

  if (!itemsContainer) return;

  itemsContainer.innerHTML = "";
  let total = 0;
  const cartKeys = Object.keys(cart);

  if (cartKeys.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; padding: 30px 0; color: var(--muted);">
        <i class="fa-solid fa-bag-shopping" style="font-size: 36px; margin-bottom: 10px; display: block;"></i>
        Giỏ hàng của bạn đang trống!
      </div>`;
  } else {
    for (const id of cartKeys) {
      const it = cart[id];
      total += (it.price || 0) * (it.qty || 0);

      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.style.cssText = "display: flex; align-items: center; gap: 12px; padding: 10px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 10px;";
      row.innerHTML = `
        <img src="${getImageUrl(it.image)}" alt="${it.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;"/>
        <div style="flex:1">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${it.name}</div>
          <div style="color:#0b63d6; font-size: 13px; margin-top: 2px; font-weight: 600;">
            ${currency(it.price)} × <strong>${it.qty}</strong>
          </div>
        </div>
        <div>
          <button class="btn-clear" data-remove="${id}" title="Xóa sản phẩm" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 6px;">
            <i class="fa-regular fa-trash-can" style="font-size: 14px;"></i>
          </button>
        </div>`;
      itemsContainer.appendChild(row);
    }
  }

  if (cartTotalEl) {
    cartTotalEl.textContent = currency(total);
  }
}

function openCart() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    modal.setAttribute("aria-hidden", "false");
    renderCart();
  }
}

function closeCart() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    modal.setAttribute("aria-hidden", "true");
  }
}

function showToast(message, type = "wishlist-add") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Chọn icon tương ứng với hành động
  let iconHtml = '<i class="fa-solid fa-heart"></i>';
  if (type === "wishlist-remove") {
    iconHtml = '<i class="fa-regular fa-heart"></i>';
  } else if (type === "success") {
    iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  }

  const toast = document.createElement("div");
  toast.className = `minishop-toast ${type}`;
  toast.innerHTML = `${iconHtml} <span>${message}</span>`;

  container.appendChild(toast);

  // Tự động ẩn mượt sau 2.5 giây
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ==========================================================================
   3. EVENT LISTENERS DÙNG CHUNG
   ========================================================================== */
document.addEventListener("click", (e) => {
  // Nút Trái Tim Yêu Thích
  const favBtn = e.target.closest("[data-fav]");
  if (favBtn) {
    const id = favBtn.dataset.fav;
    toggleWishlist(id);
    return;
  }

  // Nút Thêm Vào Giỏ
  const addBtn = e.target.closest(".add");
  if (addBtn) {
    addToCart(addBtn.dataset.id);
    return;
  }

  // Nút Xem Chi Tiết (Tự động tính toán đường dẫn chính xác)
  const viewBtn = e.target.closest(".view");
  if (viewBtn) {
    const id = viewBtn.dataset.id;
    const isInsideHTMLFolder = window.location.pathname.includes("/HTML/");
    const targetUrl = isInsideHTMLFolder ? `chitietsanpham.html?id=${id}` : `HTML/chitietsanpham.html?id=${id}`;
    window.location.href = targetUrl;
    return;
  }

  if (e.target.closest("#cartBtn")) {
    openCart();
    return;
  }
  if (e.target.closest("#closeCart")) {
    closeCart();
    return;
  }

  const remBtn = e.target.closest("[data-remove]");
  if (remBtn) {
    const id = remBtn.dataset.remove;
    const cart = getCart();
    delete cart[id];
    saveCart(cart);
    renderCart();
    updateCartCount();
    return;
  }

  if (e.target.id === "clearCart") {
    localStorage.removeItem("minishop_cart");
    renderCart();
    updateCartCount();
    showToast("Đã xóa sạch giỏ hàng!");
    return;
  }

  if (e.target.id === "checkoutBtn") {
    const cart = getCart();
    if (Object.keys(cart).length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    const isInsideHTMLFolder = window.location.pathname.includes("/HTML/");
    window.location.href = isInsideHTMLFolder ? "thanhtoan.html" : "HTML/thanhtoan.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const productList = window.PRODUCTS || window.PRODUCTS_DATA || [];
  renderProducts(productList);
  updateCartCount();

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Cảm ơn bạn đã đăng ký nhận bản tin khuyến mãi từ MiniShop!");
      e.target.reset();
    });
  }

  const searchEl = document.getElementById("searchInput");
  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      const currentProducts = window.PRODUCTS || window.PRODUCTS_DATA || [];
      if (!q) {
        renderProducts(currentProducts);
        return;
      }
      const filtered = currentProducts.filter((p) =>
        (p.name || "").toLowerCase().includes(q)
      );
      renderProducts(filtered);
    });
  }

  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.addEventListener("click", (ev) => {
      if (ev.target === cartModal) closeCart();
    });
  }
});