// Định dạng VND
function currency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n || 0);
}

function getImg(path) {
  if (typeof window.resolveProductImage === "function") {
    return window.resolveProductImage(path);
  }
  return path || "../images/placeholder.jpg";
}

function getProductDescription(product) {
  if (!product) return "Sản phẩm thời trang cao cấp, kiểu dáng hiện đại.";
  const base = {
    nam: "Dành cho nam giới với chất liệu thoáng mát, bền đẹp và lịch sự.",
    nu: "Thiết kế tôn dáng, mềm mại và dễ kết hợp phụ kiện.",
    giay: "Đế êm ái, chống trượt, phù hợp mang hàng ngày.",
  };
  return `${product.desc || "Sản phẩm phong cách mới nhất."} ${base[product.category] || ""}`;
}

function getProductReviews(product) {
  const fallback = [
    { name: "Lan", rating: 5, text: "Chất liệu mềm mại, mặc rất thoải mái." },
    { name: "Minh", rating: 4, text: "Thiết kế đẹp, giá hợp lý và giao hàng nhanh." },
  ];
  if (!product) return fallback;

  const saved = JSON.parse(localStorage.getItem("minishop_reviews") || "{}");
  return [...(saved[product.id] || []), ...fallback];
}

function saveReview(productId, review) {
  const saved = JSON.parse(localStorage.getItem("minishop_reviews") || "{}");
  const list = saved[productId] || [];
  list.unshift(review);
  saved[productId] = list;
  localStorage.setItem("minishop_reviews", JSON.stringify(saved));
}

// Quản lý Giỏ hàng
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  const count = Object.values(cart).reduce((s, it) => s + (it.qty || 0), 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

function addToCart(id, qty = 1) {
  const productList = window.PRODUCTS || window.PRODUCTS_DATA || [];
  const product = productList.find((p) => p.id == id);
  if (!product) return;

  const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
  if (cart[id]) cart[id].qty += qty;
  else cart[id] = { ...product, qty };

  localStorage.setItem("minishop_cart", JSON.stringify(cart));
  updateCartCount();
  showToast(`Đã thêm ${qty} "${product.name}" vào giỏ hàng!`);
}

// Hàm hiển thị Toast Notification
function showToast(msg, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Render sản phẩm liên quan
function renderRelated(category, currentId) {
  const container = document.getElementById("relatedProducts");
  if (!container) return;

  const productList = window.PRODUCTS || window.PRODUCTS_DATA || [];
  const list = productList
    .filter((p) => p.category === category && p.id != currentId)
    .slice(0, 4);

  if (!list.length) {
    container.style.display = "none";
    return;
  }

  container.style.display = "grid";
  container.innerHTML = list
    .map(
      (p) => `
    <div class="product-card">
      <div class="product-thumb-wrap">
        <img class="product-thumb" src="${getImg(p.image)}" alt="${p.name}"/>
      </div>
      <div class="product-info">
        <h4 class="product-title">${p.name}</h4>
        <div class="product-price">${currency(p.price)}</div>
        <a href="chitietsanpham.html?id=${p.id}" class="btn-add-cart" style="text-align:center; text-decoration:none;">
          <i class="fa-regular fa-eye"></i> Xem chi tiết
        </a>
      </div>
    </div>`
    )
    .join("");
}

// Render toàn bộ chi tiết sản phẩm
function renderDetail(id) {
  const productList = window.PRODUCTS || window.PRODUCTS_DATA || [
    { id: 1, name: "Áo thun Basic Trắng", price: 129000, category: "nam", image: "../images/aothun.jpg", desc: "Áo thun cotton mềm mại, thoáng mát." },
    { id: 2, name: "Áo khoác denim", price: 499000, category: "nam", image: "../images/aokhoac.jpg", desc: "Áo khoác Denim cao cấp thiết kế trẻ trung." }
  ];

  const p = productList.find((x) => x.id == id);
  const root = document.getElementById("productDetail");
  if (!root) return;

  if (!p) {
    root.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <h2>Sản phẩm không tồn tại!</h2>
        <a href="danhmucsanpham.html" class="btn add" style="display:inline-block; margin-top:16px;">Quay lại danh mục</a>
      </div>`;
    return;
  }

  const description = getProductDescription(p);
  const reviews = getProductReviews(p);

  root.innerHTML = `
    <div class="product-detail-card">
      <div class="product-main">
        <div class="product-media">
          <img src="${getImg(p.image)}" alt="${p.name}" />
        </div>
        <div class="product-info">
          <h2>${p.name}</h2>
          <div class="product-price">${currency(p.price)}</div>
          <p style="color:var(--text-muted); line-height: 1.6; margin-bottom: 20px;">${description}</p>
          
          <div class="size-selector" style="margin-bottom: 20px;">
            <label style="font-weight:700; font-size:13px; display:block; margin-bottom:8px;">Kích cỡ (Size):</label>
            <div class="size-options" style="display:flex; gap:10px;">
              <button type="button" class="size-btn active">S</button>
              <button type="button" class="size-btn">M</button>
              <button type="button" class="size-btn">L</button>
              <button type="button" class="size-btn">XL</button>
            </div>
          </div>

          <div class="quantity-control" style="margin-bottom: 24px;">
            <label style="font-weight:700; font-size:13px; display:block; margin-bottom:8px;">Số lượng:</label>
            <div class="qty-input-group" style="display:inline-flex; align-items:center; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
              <button type="button" class="qty-btn" id="qtyMinus" style="padding:8px 14px; background:#f1f5f9; border:none; cursor:pointer; font-weight:700;">-</button>
              <input type="number" id="qtyInput" class="qty-input" value="1" min="1" readonly style="width:40px; text-align:center; border:none; font-weight:700;" />
              <button type="button" class="qty-btn" id="qtyPlus" style="padding:8px 14px; background:#f1f5f9; border:none; cursor:pointer; font-weight:700;">+</button>
            </div>
          </div>

          <div class="product-actions" style="display:flex; gap:12px;">
            <button id="addToCartBtn" class="btn add-to-cart" style="flex:1; padding:12px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:10px; font-weight:700; cursor:pointer;"><i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ</button>
            <button id="buyNow" class="btn buy-now" style="flex:1; padding:12px; background:#2563eb; color:#ffffff; border:none; border-radius:10px; font-weight:700; cursor:pointer;">Mua ngay</button>
          </div>
        </div>
      </div>

      <!-- MÔ TẢ SẢN PHẨM -->
      <section class="detail-section" style="margin-top: 32px; background:#ffffff; padding:24px; border-radius:16px; border:1px solid #e2e8f0;">
        <h3 style="font-size:18px; font-weight:800; margin-bottom:12px;"><i class="fa-solid fa-align-left" style="color:#2563eb;"></i> Mô tả sản phẩm</h3>
        <p style="line-height: 1.7; color: var(--text-main);">${description}</p>
      </section>

      <!-- KHU VỰC ĐÁNH GIÁ SỬ DỤNG BỘ SAO VÀNG VẪN LÀ MÀU VÀNG CAM -->
      <section class="detail-section" style="margin-top: 24px; background:#ffffff; padding:24px; border-radius:16px; border:1px solid #e2e8f0;">
        <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;"><i class="fa-regular fa-comments" style="color:#2563eb;"></i> Đánh giá từ khách hàng</h3>
        
        <!-- FORM ĐÁNH GIÁ TƯƠNG TÁC -->
        <form id="reviewForm" class="review-form" style="background:#f8fafc; padding:20px; border-radius:14px; border:1px solid #e2e8f0;">
          <div style="margin-bottom:12px;">
            <input id="reviewName" type="text" placeholder="Tên của bạn *" required style="width:100%; padding:10px 14px; border-radius:8px; border:1px solid #cbd5e1; box-sizing:border-box;" />
          </div>

          <!-- BỘ CHỌN SAO VÀNG CAM VÀNG LẬP LÁNH -->
          <div style="display:flex; align-items:center; gap:12px; margin:12px 0; background:#ffffff; padding:10px 16px; border-radius:10px; border:1px solid #cbd5e1; width:fit-content;">
            <span style="font-size:13px; font-weight:700; color:#64748b;">Đánh giá của bạn:</span>
            <div id="starPicker" style="display:flex; gap:6px; cursor:pointer; font-size:22px;">
              <i class="fa-solid fa-star" data-value="1" style="color: #f59e0b;"></i>
              <i class="fa-solid fa-star" data-value="2" style="color: #f59e0b;"></i>
              <i class="fa-solid fa-star" data-value="3" style="color: #f59e0b;"></i>
              <i class="fa-solid fa-star" data-value="4" style="color: #f59e0b;"></i>
              <i class="fa-solid fa-star" data-value="5" style="color: #f59e0b;"></i>
            </div>
            <span id="starRatingText" style="font-size:13px; font-weight:700; color:#f59e0b;">(5/5 - Tuyệt vời)</span>
          </div>

          <div style="margin-bottom:12px;">
            <textarea id="reviewText" rows="3" placeholder="Nhập cảm nhận của bạn về sản phẩm..." required style="width:100%; padding:10px 14px; border-radius:8px; border:1px solid #cbd5e1; box-sizing:border-box;"></textarea>
          </div>

          <button type="submit" style="background:#2563eb; color:#fff; border:none; padding:10px 24px; border-radius:8px; font-weight:700; cursor:pointer;">Gửi đánh giá</button>
        </form>

        <!-- DANH SÁCH BÌNH LUẬN ĐÃ LƯU (SAO CŨNG LÀ MÀU VÀNG CAM) -->
        <div id="reviewListContainer" class="review-list" style="margin-top: 20px; display:flex; flex-direction:column; gap:12px;">
          ${reviews
            .map(
              (r) => `
            <div class="review-item" style="background:#f8fafc; padding:14px 18px; border-radius:12px; border:1px solid #e2e8f0;">
              <strong style="font-size:14px; color:#0f172a;">${r.name}</strong>
              <div class="review-stars" style="margin:4px 0 6px;">
                ${Array.from({ length: 5 }, (_, i) => 
                  `<i class="${i < r.rating ? 'fa-solid' : 'fa-regular'} fa-star" style="color: #f59e0b; font-size:14px;"></i>`
                ).join("")}
              </div>
              <p style="margin:0; color:#334155; font-size:14px;">${r.text}</p>
            </div>`
            )
            .join("")}
        </div>
      </section>
    </div>
  `;

  // Xử lý nút tăng giảm số lượng
  const qtyInput = document.getElementById("qtyInput");
  document.getElementById("qtyMinus")?.addEventListener("click", () => {
    if (qtyInput.value > 1) qtyInput.value = Number(qtyInput.value) - 1;
  });
  document.getElementById("qtyPlus")?.addEventListener("click", () => {
    qtyInput.value = Number(qtyInput.value) + 1;
  });

  // Chọn Size
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Sự kiện Thêm vào giỏ & Mua ngay
  document.getElementById("addToCartBtn")?.addEventListener("click", () => {
    addToCart(id, Number(qtyInput.value));
  });

  document.getElementById("buyNow")?.addEventListener("click", () => {
    addToCart(id, Number(qtyInput.value));
    window.location.href = "thanhtoan.html";
  });

  // LOGIC TƯƠNG TÁC RÊ/CLICK BỘ SAO VÀNG CAM
  const starPicker = document.getElementById("starPicker");
  const starRatingText = document.getElementById("starRatingText");
  let selectedRating = 5;

  const ratingTexts = {
    1: "(1/5 - Rất tệ)",
    2: "(2/5 - Tệ)",
    3: "(3/5 - Bình thường)",
    4: "(4/5 - Tốt)",
    5: "(5/5 - Tuyệt vời)"
  };

  if (starPicker) {
    const stars = starPicker.querySelectorAll("i");

    function updateStars(rating) {
      stars.forEach((star, index) => {
        if (index < rating) {
          star.style.color = "#f59e0b"; // Vàng cam
          star.className = "fa-solid fa-star";
        } else {
          star.style.color = "#cbd5e1"; // Xám nhẹ khi bỏ chọn
          star.className = "fa-regular fa-star";
        }
      });
      if (starRatingText) starRatingText.textContent = ratingTexts[rating] || `(${rating}/5)`;
    }

    stars.forEach((star) => {
      star.addEventListener("click", () => {
        selectedRating = Number(star.getAttribute("data-value"));
        updateStars(selectedRating);
      });

      star.addEventListener("mouseenter", () => {
        const hoverVal = Number(star.getAttribute("data-value"));
        updateStars(hoverVal);
      });
    });

    starPicker.addEventListener("mouseleave", () => {
      updateStars(selectedRating);
    });
  }

  // Form Đánh giá
  document.getElementById("reviewForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();

    if (!name || !text) return;

    // Lưu vào LocalStorage
    saveReview(id, { name, rating: selectedRating, text });

    // Render lại chi tiết để hiện bình luận mới nhất
    renderDetail(id);
    showToast("Cảm ơn bạn đã gửi đánh giá!");
  });

  renderRelated(p.category, p.id);
}

// Khởi tạo trang
document.addEventListener("DOMContentLoaded", () => {
  const qp = new URLSearchParams(window.location.search);
  const id = Number(qp.get("id")) || 1;
  renderDetail(id);
  updateCartCount();

  // Mở giỏ hàng Pop-up
  document.getElementById("cartBtn")?.addEventListener("click", () => {
    document.getElementById("cartModal")?.setAttribute("aria-hidden", "false");
  });
  document.getElementById("closeCart")?.addEventListener("click", () => {
    document.getElementById("cartModal")?.setAttribute("aria-hidden", "true");
  });
});

// Cho phép file test (Node.js) xuất và đọc được các hàm này
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getProductDescription, getProductReviews };
}