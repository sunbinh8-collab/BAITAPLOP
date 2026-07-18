document.addEventListener("DOMContentLoaded", function () {
  // Đã bỏ window.PRODUCTS và chuyển thành biến cục bộ productsRepo
  var productsRepo = [
    {id:1,name:'Áo thun Basic Trắng',price:129000,image:'https://via.placeholder.com/800x800?text=Ao+thun+1',desc:'Áo thun cotton mềm mại, thoáng mát, phù hợp đi chơi và đi làm.'},
    {id:2,name:'Quần jean ôm',price:299000,image:'https://via.placeholder.com/800x800?text=Quan+jean',desc:'Quần jean co giãn, may tỉ mỉ, form ôm vừa phải.'},
    {id:3,name:'Váy maxi hoa',price:349000,image:'https://via.placeholder.com/800x800?text=Vay+maxi',desc:'Váy maxi nữ tính, họa tiết hoa nhẹ nhàng.'},
    {id:4,name:'Áo khoác denim',price:499000,image:'https://via.placeholder.com/800x800?text=Ao+khoac',desc:'Áo khoác denim phong cách, bền màu.'},
    {id:5,name:'Áo sơ mi caro',price:189000,image:'https://via.placeholder.com/800x800?text=Ao+so+mi',desc:'Áo sơ mi cắt may chuẩn, phù hợp công sở.'},
    {id:6,name:'Giày sneaker trắng',price:599000,image:'https://via.placeholder.com/800x800?text=Sneaker',desc:'Giày sneaker thời trang, đế êm, dễ phối đồ.'}
  ];

  var VALID_COUPONS = {
    "MINI50": { type: "cash", value: 50000, msg: "Áp dụng thành công: Giảm 50k đơn hàng!" },
    "MINI100": { type: "cash", value: 100000, msg: "Áp dụng thành công: Giảm 100k đơn hàng!" },
    "FREESHIP": { type: "shipping", value: 0, msg: "Áp dụng thành công: Miễn phí vận chuyển!" }
  };

  if(!localStorage.getItem("mini_shipping_km")) {
    localStorage.setItem("mini_shipping_km", Math.floor(Math.random() * 25) + 2);
  }

  function formatVND(n) { return "₫" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function getCart() { return JSON.parse(localStorage.getItem("mini_cart") || "[]"); }
  function setCart(c) { localStorage.setItem("mini_cart", JSON.stringify(c)); updateCartCount(); }

  function updateCartCount() {
    var cart = getCart();
    var count = cart.reduce(function (s, i) { return s + (i.qty || 0); }, 0);
    var btn = document.getElementById("headerCartBtn");
    if (btn) btn.textContent = "Giỏ (" + count + ")";
  }

  function showToast(message) {
    var oldToast = document.querySelector(".toast-msg"); if (oldToast) oldToast.remove();
    var toast = document.createElement("div"); toast.className = "toast-msg";
    toast.innerHTML = '<span class="toast-icon">✓</span> ' + message; document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add("show"); }, 50);
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  function getProductImage(item) {
    if (item.image) return item.image;
    if (item.img) return item.img;
    var found = productsRepo.find(function(x) { return x.id === item.id; });
    return found && found.image ? found.image : "../images/products/aothunden.jpg";
  }

  function renderCart() {
    var cart = getCart();
    var body = document.getElementById("cartBody");
    var mainGrid = document.getElementById("mainCartGrid");
    var emptyBlock = document.getElementById("emptyCartBlock");
    body.innerHTML = "";
    
    if (cart.length === 0) {
      mainGrid.style.display = "none"; emptyBlock.style.display = "block";
      localStorage.setItem("mini_cart_discount", "0");
      localStorage.setItem("mini_shipping_fee", "0");
      localStorage.removeItem("mini_cart_coupon_code");
      return;
    }

    mainGrid.style.display = "grid"; emptyBlock.style.display = "none";

    cart.forEach(function (item, index) {
      var tr = document.createElement("tr");
      var variantText = "";
      if (item.size || item.color) {
        var isHex = item.color && item.color.startsWith("#");
        var colorDisplay = isHex ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item.color}; border:1px solid #ccc; vertical-align:middle; margin-bottom:2px;"></span>` : item.color;
        variantText = `<div class="product-meta">${item.size ? "Size: " + item.size : ""}${item.size && item.color ? " • " : ""}${item.color ? "Màu: " + colorDisplay : ""}</div>`;
      }

      var displayName = item.name || item.title || "Sản phẩm MiniShop";

      tr.innerHTML = `
        <td>
          <div class="product-info-cell">
            <img src="${getProductImage(item)}" alt="${displayName}" loading="lazy" width="70" height="70">
            <div><div class="product-title">${displayName}</div>${variantText}</div>
          </div>
        </td>
        <td style="text-align: center;">
          <div class="quantity-group" style="margin: 0 auto;">
            <button type="button" class="qty-btn minus-btn" data-index="${index}">-</button>
            <input class="qty-input-v2" type="number" value="${item.qty || 1}" readonly />
            <button type="button" class="qty-btn plus-btn" data-index="${index}">+</button>
          </div>
        </td>
        <td class="cell-price" style="text-align: right;">${formatVND(item.price || 0)}</td>
        <td class="cell-subtotal" style="text-align: right; padding-right: 10px;">
          <span>${formatVND((item.qty || 1) * (item.price || 0))}</span>
          <button class="btn-remove" data-index="${index}">🗑</button>
        </td>
      `;
      body.appendChild(tr);
    });

    attachCartEvents();
    recalc();
  }

  function attachCartEvents() {
    var cart = getCart();
    document.querySelectorAll(".minus-btn").forEach(b => b.addEventListener("click", function() { 
      var idx = this.getAttribute("data-index"); 
      if(cart[idx].qty > 1) { cart[idx].qty--; setCart(cart); renderCart(); } 
    }));
    document.querySelectorAll(".plus-btn").forEach(b => b.addEventListener("click", function() { 
      var idx = this.getAttribute("data-index"); 
      cart[idx].qty++; setCart(cart); renderCart(); 
    }));
    document.querySelectorAll(".btn-remove").forEach(b => b.addEventListener("click", function() { 
      var idx = this.getAttribute("data-index"); 
      var displayName = cart[idx].name || cart[idx].title || "Sản phẩm"; 
      cart.splice(idx, 1); setCart(cart); renderCart(); 
      showToast('Đã xóa "' + displayName + '" khỏi giỏ hàng'); 
    }));
  }

  function recalc() {
    var cart = getCart();
    var total = cart.reduce(function (s, i) { return s + i.price * (i.qty || 0); }, 0);
    var km = parseInt(localStorage.getItem("mini_shipping_km") || "5");
    
    var shippingFee = km <= 15 ? 0 : (km - 15) * 2000;
    var activeCoupon = localStorage.getItem("mini_cart_coupon_code") || "";
    var discount = 0;

    if (activeCoupon === "FREESHIP") {
      shippingFee = 0; discount = 0;
      document.getElementById("shipping").innerHTML = `<span style="color:#2ed573;">Miễn phí (FREESHIP - ${km}km)</span>`;
    } else {
      document.getElementById("shipping").innerHTML = shippingFee === 0 ? `<span style="color:#2ed573;">Miễn phí (${km}km)</span>` : `<span>${formatVND(shippingFee)} (${km}km)</span>`;
      if (VALID_COUPONS[activeCoupon] && VALID_COUPONS[activeCoupon].type === "cash") {
        discount = VALID_COUPONS[activeCoupon].value;
      }
    }

    if (discount > total) discount = total;
    var grand = total + shippingFee - discount;
    if (grand < 0) grand = 0;

    document.getElementById("subTotal").textContent = formatVND(total);
    document.getElementById("discountText").textContent = activeCoupon && activeCoupon !== "FREESHIP" ? `-${formatVND(discount)} (${activeCoupon})` : `-₫0`;
    document.getElementById("grandTotal").textContent = formatVND(grand);

    localStorage.setItem("mini_shipping_fee", shippingFee);
    localStorage.setItem("mini_cart_discount", discount);
  }

  var clearCartModal = document.getElementById("clearCartModal");
  document.getElementById("clearCart").addEventListener("click", function() { clearCartModal.classList.add("active"); });
  document.getElementById("cancelClearCart").addEventListener("click", function() { clearCartModal.classList.remove("active"); });

  document.getElementById("confirmClearCart").addEventListener("click", function () {
    localStorage.setItem("mini_cart", "[]");
    localStorage.setItem("mini_cart_discount", "0");
    localStorage.setItem("mini_shipping_fee", "0");
    localStorage.removeItem("mini_cart_coupon_code");
    renderCart(); updateCartCount(); clearCartModal.classList.remove("active"); showToast("Đã xóa sạch giỏ hàng");
  });

  document.getElementById("applyCoupon").addEventListener("click", function () {
    var code = document.getElementById("coupon").value.trim().toUpperCase();
    var msgEl = document.getElementById("couponMessage");
    if (!getCart().length) return;

    if (VALID_COUPONS.hasOwnProperty(code)) {
      localStorage.setItem("mini_cart_coupon_code", code);
      msgEl.style.color = "var(--secondary-color)"; msgEl.textContent = VALID_COUPONS[code].msg;
      showToast("Áp dụng mã thành công!");
      renderCart();
    } else {
      msgEl.style.color = "var(--primary-color)"; msgEl.textContent = "Mã giảm giá không hợp lệ hoặc đã hết hạn.";
    }
  });

  var sessionUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (sessionUser) {
    var navLogin = document.getElementById("navLoginLink");
    var navRegister = document.getElementById("navRegisterLink");
    if (navLogin) { navLogin.textContent = sessionUser.name; navLogin.href = "taikhoan.html"; }
    if (navRegister) {
      navRegister.textContent = "Đăng xuất"; navRegister.href = "#";
      navRegister.addEventListener("click", function (e) { 
        e.preventDefault(); 
        localStorage.removeItem("currentUser"); 
        localStorage.removeItem("mini_profile"); 
        window.location.reload(); 
      });
    }
  }

  updateCartCount();
  renderCart();
});