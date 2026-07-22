document.addEventListener("DOMContentLoaded", () => {
  const wishlistGrid = document.getElementById("wishlistGrid");
  const wishlistCount = document.getElementById("wishlistCount");
  const btnClearAll = document.getElementById("btnClearAllWishlist");

  // Định dạng tiền VND
  const currency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  // Xử lý đường dẫn ảnh
  function getImg(path) {
    if (typeof window.resolveProductImage === "function") {
      return window.resolveProductImage(path);
    }
    return path || "../images/placeholder.jpg";
  }

  // Mặc định rỗng, không tự thả tim sản phẩm
  const defaultWishlistIds = [];

  // 1. Lấy danh sách ID sản phẩm yêu thích từ localStorage
  function getWishlist() {
    const data = localStorage.getItem("minishop_wishlist");
    if (!data) {
      localStorage.setItem("minishop_wishlist", JSON.stringify(defaultWishlistIds));
      return defaultWishlistIds;
    }
    return JSON.parse(data);
  }

  function saveWishlist(list) {
    localStorage.setItem("minishop_wishlist", JSON.stringify(list));
    renderWishlist();
  }

  // 2. Render danh sách sản phẩm ra màn hình
  function renderWishlist() {
    const ids = getWishlist();
    
    // Sản phẩm dự phòng nếu chưa có product-data.js
    const fallbackProducts = [
      { id: 1, name: "Áo thun Basic Trắng", price: 129000, image: "../images/aothun.jpg" },
      { id: 2, name: "Quần jean ôm", price: 299000, image: "../images/quanjean.jpg" },
      { id: 3, name: "Váy maxi hoa", price: 350000, image: "../images/vaymaxi.jpg" },
      { id: 4, name: "Áo khoác denim", price: 499000, image: "../images/aokhoac.jpg" }
    ];

    const allProducts = (window.PRODUCTS && window.PRODUCTS.length > 0)
      ? window.PRODUCTS
      : (window.PRODUCTS_DATA || fallbackProducts);
    
    // Lọc ra danh sách sản phẩm thuộc danh sách thích
    const wishlistProducts = allProducts.filter((p) => ids.includes(p.id) || ids.includes(String(p.id)));

    if (wishlistCount) wishlistCount.textContent = wishlistProducts.length;

    if (!wishlistGrid) return;

    if (wishlistProducts.length === 0) {
      if (btnClearAll) btnClearAll.style.display = "none";
      wishlistGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-heart"></i>
          <h3 style="font-size: 18px; color: #0f172a; margin-bottom: 8px;">Danh sách yêu thích trống!</h3>
          <p>Bạn chưa lưu sản phẩm nào. Hãy dạo quanh cửa hàng và chọn món đồ ưng ý nhé.</p>
          <a href="danhmucsanpham.html" class="btn-shop-now">Khám phá sản phẩm</a>
        </div>`;
      return;
    }

    if (btnClearAll) btnClearAll.style.display = "inline-block";

    wishlistGrid.innerHTML = wishlistProducts
      .map(
        (p) => `
        <div class="product">
          <div class="product-media">
            <img src="${getImg(p.image)}" alt="${p.name}" />
            <!-- NÚT TIM YÊU THÍCH MÀU ĐỎ MẶC ĐỊNH -->
            <button class="btn-remove-fav" onclick="removeWishlist('${p.id}')" title="Bỏ thích sản phẩm này">
              <i class="fa-solid fa-heart"></i>
            </button>
          </div>
          <div class="product-body">
            <h4 class="product-name">${p.name}</h4>
            <div class="product-price">${currency(p.price)}</div>
            <div class="product-actions">
              <button class="btn-secondary" onclick="viewDetail('${p.id}')">
                <i class="fa-regular fa-eye"></i> Xem
              </button>
              <button class="btn-primary" onclick="addToCart('${p.id}')">
                <i class="fa-solid fa-cart-plus"></i> Thêm giỏ
              </button>
            </div>
          </div>
        </div>`
      )
      .join("");
  }

  // 3. Xóa 1 sản phẩm khỏi Yêu thích
  window.removeWishlist = function (id) {
    let ids = getWishlist();
    ids = ids.filter((item) => String(item) !== String(id));
    saveWishlist(ids);
  };

  // 4. Xem chi tiết
  window.viewDetail = function (id) {
    window.location.href = `chitietsanpham.html?id=${id}`;
  };

  // 5. Thêm vào Giỏ hàng
  window.addToCart = function (id) {
    const fallbackProducts = [
      { id: 1, name: "Áo thun Basic Trắng", price: 129000, image: "../images/aothun.jpg" },
      { id: 2, name: "Quần jean ôm", price: 299000, image: "../images/quanjean.jpg" },
      { id: 3, name: "Váy maxi hoa", price: 350000, image: "../images/vaymaxi.jpg" },
      { id: 4, name: "Áo khoác denim", price: 499000, image: "../images/aokhoac.jpg" }
    ];
    const allProducts = (window.PRODUCTS && window.PRODUCTS.length > 0)
      ? window.PRODUCTS
      : (window.PRODUCTS_DATA || fallbackProducts);

    const product = allProducts.find((p) => String(p.id) === String(id));
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
    if (cart[id]) cart[id].qty += 1;
    else cart[id] = { ...product, qty: 1 };

    localStorage.setItem("minishop_cart", JSON.stringify(cart));
    updateCartCount();
    alert(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
  };

  // 6. Xóa tất cả
  btnClearAll?.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm yêu thích?")) {
      saveWishlist([]);
    }
  });

  // Cập nhật số giỏ hàng trên Header
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
    const countEl = document.getElementById("cart-count");
    if (countEl) {
      const total = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
      countEl.textContent = total;
    }
  }

  updateCartCount();
  renderWishlist();
});