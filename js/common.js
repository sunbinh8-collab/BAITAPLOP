(function () {
  function ensureToast() {
    var toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    return toast;
  }

  // safe JSON parse helper for localStorage values
  function safeParse(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error("safeParse error for", key, err);
      try {
        localStorage.removeItem(key);
      } catch (e) {}
      return fallback;
    }
  }

  window.showToast = function (message, type) {
    var toast = ensureToast();
    toast.textContent = message;
    toast.className = "toast visible" + (type ? " " + type : "");
    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(function () {
      toast.className = "toast";
    }, 3200);
  };

  window.pulseCart = function () {
    var btn = document.querySelector(".cart-btn");
    if (!btn) return;
    btn.classList.add("pulse");
    clearTimeout(window.__pulseCartTimeout);
    window.__pulseCartTimeout = setTimeout(function () {
      btn.classList.remove("pulse");
    }, 450);
  };

  // Global cart count updater
  window.updateCartCount = function () {
    try {
      var cart = safeParse("mini_cart", []);
      var count = cart.reduce(function (s, i) {
        return s + (i.qty || 0);
      }, 0);
      var btn = document.querySelector(".cart-btn");
      if (btn) {
        // ensure icon exists
        if (!btn.querySelector(".cart-icon")) {
          btn.insertAdjacentHTML(
            "afterbegin",
            '<span class="cart-icon" aria-hidden="true"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path d="M7 4h-2l-1 2h2l1-2zm0 0h10l1.2 6H8.8L7 4zm12 8h-9v2h9v-2zm-9 4h9v2h-9v-2z"/></svg></span>',
          );
        }
        var countEl = btn.querySelector(".cart-count");
        if (!countEl) {
          countEl = document.createElement("span");
          countEl.className = "cart-count";
          btn.appendChild(countEl);
        }
        countEl.textContent = count;
        btn.setAttribute("aria-label", "Giỏ hàng (" + count + " sản phẩm)");
      }
      // also update any header/nav cart-count elements (injected icons)
      document
        .querySelectorAll(
          ".nav-user-cart .cart-count, .header-cart .cart-count",
        )
        .forEach(function (el) {
          el.textContent = count;
        });
    } catch (e) {
      console.error("updateCartCount error", e);
    }
  };

  // Unified addToCart function used by pages
  window.addToCart = function (item) {
    try {
      console.log("addToCart called with", item);
      if (!item || !item.id) return console.warn("addToCart missing id", item);
      // Prevent duplicate rapid adds of the same variant from multiple handlers
      try {
        var last = window.__lastAdd || { key: null, t: 0 };
        var key =
          (item.id || "") + "|" + (item.size || "") + "|" + (item.color || "");
        var now = Date.now();
        if (last.key === key && now - last.t < 700) {
          console.warn("Ignored duplicate addToCart for", key);
          return;
        }
        window.__lastAdd = { key: key, t: now };
      } catch (e) {}
      var cart = safeParse("mini_cart", []);
      var match = cart.find(function (i) {
        return (
          i.id === item.id &&
          (i.size || "") === (item.size || "") &&
          (i.color || "") === (item.color || "")
        );
      });
      if (match) {
        match.qty = (match.qty || 0) + (item.qty || 1);
      } else {
        cart.push({
          id: item.id,
          title: item.title || item.name || "",
          price: item.price || 0,
          qty: item.qty || 1,
          size: item.size || "",
          color: item.color || "",
        });
      }
      try {
        localStorage.setItem("mini_cart", JSON.stringify(cart));
      } catch (err) {
        console.error("Failed to save mini_cart", err);
      }
      console.log("cart updated", cart);
      window.updateCartCount();
      window.showToast(
        item.title ? 'Đã thêm "' + item.title + '" vào giỏ' : "Đã thêm vào giỏ",
        "success",
      );
      window.pulseCart();
    } catch (e) {
      console.error("addToCart error", e);
    }
  };

  // Toggle visibility of login/register/cart links based on auth state
  document.addEventListener("DOMContentLoaded", function () {
    try {
      var user = JSON.parse(localStorage.getItem("currentUser") || "null");
      var isLoggedIn = !!user;

      // Links by href
      var loginLinks = document.querySelectorAll('a[href="dangnhap.html"]');
      var registerLinks = document.querySelectorAll('a[href="dangky.html"]');
      var cartBtns = document.querySelectorAll(
        '.cart-btn, a[href="giohang.html"]',
      );

      function setHidden(nodeList, hidden) {
        nodeList.forEach(function (el) {
          if (hidden) el.style.display = "none";
          else el.style.display = "";
        });
      }

      setHidden(loginLinks, isLoggedIn);
      setHidden(registerLinks, isLoggedIn);
      setHidden(cartBtns, isLoggedIn);

      // Inject user menu into header nav when logged in
      var existingUserMenu = document.getElementById("userMenu");
      if (isLoggedIn) {
        if (!existingUserMenu) {
          var nav = document.querySelector(".header-inner");
          if (nav) {
            var wrapper = document.createElement("div");
            wrapper.id = "userMenu";
            wrapper.className = "user-menu";
            // inject a small cart icon in place of the user label
            wrapper.innerHTML =
              '<a class="nav-user-cart header-cart" href="giohang.html" aria-label="Giỏ hàng">' +
              '<span class="cart-icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path d="M7 4h-2l-1 2h2l1-2zm0 0h10l1.2 6H8.8L7 4zm12 8h-9v2h9v-2zm-9 4h9v2h-9v-2z"/></svg>' +
              "</span>" +
              '<span class="cart-count">0</span>' +
              '<span class="sr-only">Giỏ hàng</span>' +
              "</a>";
            var container = document.querySelector(".header-inner");
            if (container) container.appendChild(wrapper);

            // show manage if admin
            var headerManage = document.getElementById("headerManage");
            if (headerManage)
              headerManage.style.display =
                user && user.role === "admin" ? "" : "none";

            // no dropdown needed; clicking the icon goes to cart
            // show default address in header if available
            window.updateHeaderDefaultAddress = function () {
              try {
                var addresses = JSON.parse(
                  localStorage.getItem("mini_addresses") || "[]",
                );
                var def = addresses.find(function (a) {
                  return !!a.isDefault;
                });
                var hdr = document.querySelector(".header-inner");
                if (!hdr) return;
                var exist = document.getElementById("headerDefaultAddr");
                if (def) {
                  if (!exist) {
                    var el = document.createElement("div");
                    el.id = "headerDefaultAddr";
                    el.style.marginLeft = "12px";
                    el.style.fontSize = "0.9rem";
                    el.style.color = "var(--muted)";
                    el.textContent =
                      "Địa chỉ: " + (def.text.split(",")[0] || def.text);
                    hdr.appendChild(el);
                  } else {
                    exist.textContent =
                      "Địa chỉ: " + (def.text.split(",")[0] || def.text);
                  }
                } else if (exist) {
                  exist.parentNode.removeChild(exist);
                }
              } catch (e) {}
            };
            // initial update
            try {
              window.updateHeaderDefaultAddress &&
                window.updateHeaderDefaultAddress();
            } catch (e) {}
          }
        } else {
          // update name if menu exists
          var nameEl = existingUserMenu.querySelector("#userName");
          if (nameEl)
            nameEl.textContent = user && user.name ? user.name : "Tài khoản";
          var headerManage = document.getElementById("headerManage");
          if (headerManage)
            headerManage.style.display =
              user && user.role === "admin" ? "" : "none";
        }
      } else {
        // remove user menu when logged out
        if (existingUserMenu && existingUserMenu.parentNode)
          existingUserMenu.parentNode.removeChild(existingUserMenu);
      }

      // If on account page, show/hide admin/manage links and logout
      var manageLink = document.getElementById("manageLink");
      var logoutLink = document.getElementById("logoutLink");
      if (manageLink) {
        manageLink.style.display = user && user.role === "admin" ? "" : "none";
      }
      if (logoutLink) {
        logoutLink.style.display = isLoggedIn ? "" : "none";
      }
    } catch (e) {
      console.error("DOMContentLoaded init error", e);
    }
  });
  // ensure header cart count shows current value on load
  try {
    window.updateCartCount && window.updateCartCount();
  } catch (e) {}
  // Delegated handler: catch any click on buttons with class `add-to-cart`
  document.addEventListener("click", function (e) {
    try {
      var btn = e.target.closest && e.target.closest(".add-to-cart");
      if (!btn) return;
      console.log("add-to-cart clicked", btn);
      e.preventDefault();
      // prefer data-id when available
      var idAttr = btn.getAttribute("data-id");
      var id = idAttr ? parseInt(idAttr, 10) : null;
      var card = btn.closest && btn.closest(".product");
      var size =
        card && card.querySelector(".size-select")
          ? card.querySelector(".size-select").value
          : btn.getAttribute("data-size") || "";
      var color =
        card && card.querySelector(".color-select")
          ? card.querySelector(".color-select").value
          : btn.getAttribute("data-color") || "";
      var qty = 1;
      if (card && card.querySelector(".qty-input"))
        qty = parseInt(card.querySelector(".qty-input").value, 10) || 1;
      if (qty < 1) qty = 1;
      if (id) {
        var p =
          typeof products !== "undefined" && products.find
            ? products.find(function (x) {
                return x.id === id;
              })
            : null;
        var title =
          btn.getAttribute("data-title") ||
          (p && p.title) ||
          (card && card.querySelector("h3")
            ? card.querySelector("h3").textContent.trim()
            : "Sản phẩm");
        var price = p
          ? p.price
          : card && card.querySelector(".price")
            ? parseInt(
                (card.querySelector(".price").textContent || "").replace(
                  /[^0-9]/g,
                  "",
                ),
                10,
              ) || 0
            : 0;
        window.addToCart({
          id: id,
          title: title,
          price: price,
          qty: qty,
          size: size,
          color: color,
        });
      } else {
        // fallback: create a generic item when only title provided
        var titleOnly =
          btn.getAttribute("data-title") ||
          (card && card.querySelector("h3")
            ? card.querySelector("h3").textContent.trim()
            : "Sản phẩm");
        var priceOnly =
          parseInt(btn.getAttribute("data-price") || "0", 10) || 0;
        window.addToCart({
          id: Date.now(),
          title: titleOnly,
          price: priceOnly,
          qty: qty,
          size: size,
          color: color,
        });
      }
    } catch (err) {
      console.error("delegated add-to-cart handler error", err);
    }
  });
})();
