// Simple account page JS: tab switching and localStorage-backed profile
(function () {
  const tabs = document.querySelectorAll(".account-nav button");
  const contents = document.querySelectorAll(".tab-content");

  function showTab(name) {
    tabs.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    contents.forEach(
      (c) => (c.style.display = c.id === "tab-" + name ? "" : "none"),
    );
  }

  const logoutModal = document.getElementById("logoutModal");
  const logoutCancel = document.getElementById("logoutCancel");
  const logoutConfirm = document.getElementById("logoutConfirm");

  function openLogoutModal() {
    logoutModal.setAttribute("aria-hidden", "false");
  }

  function closeLogoutModal() {
    logoutModal.setAttribute("aria-hidden", "true");
  }

  function performLogout() {
    localStorage.removeItem("minishop_profile");
    localStorage.removeItem("minishop_current");
    localStorage.removeItem("minishop_avatar");
    localStorage.setItem(
      "minishop_logout_message",
      "Bạn đã đăng xuất khỏi tài khoản thành công!",
    );
    window.location.href = "dangnhap.html?logout=1";
  }

  document.querySelector(".account-nav").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]");
    if (!b) return;
    const tab = b.dataset.tab;
    if (tab === "logout") {
      openLogoutModal();
      return;
    }
    showTab(tab);
  });

  logoutCancel.addEventListener("click", closeLogoutModal);
  logoutConfirm.addEventListener("click", () => {
    closeLogoutModal();
    performLogout();
  });
  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) closeLogoutModal();
  });

  // profile form
  const form = document.getElementById("profileForm");
  const fields = ["fullName", "email", "phone", "address"];

  function loadProfile() {
    const p = JSON.parse(localStorage.getItem("minishop_profile") || "{}");
    fields.forEach((k) => (document.getElementById(k).value = p[k] || ""));
    document.getElementById("userNameSmall").textContent =
      p.fullName || "Khách";
    document.getElementById("userEmailSmall").textContent =
      p.email || "guest@example.com";
    // avatar: either saved data URL or initials
    const av = document.getElementById("avatarDisplay");
    const imgData = localStorage.getItem("minishop_avatar");
    if (imgData) {
      av.innerHTML = "";
      const img = document.createElement("img");
      img.src = imgData;
      av.appendChild(img);
    } else {
      const initials = (p.fullName || "Khách")
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      av.textContent = initials;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = {};
    fields.forEach((k) => (p[k] = document.getElementById(k).value));
    localStorage.setItem("minishop_profile", JSON.stringify(p));
    loadProfile();
    alert("Đã lưu (demo)");
  });

  // avatar upload
  const avatarDisplay = document.getElementById("avatarDisplay");
  const avatarInput = document.getElementById("avatarInput");
  avatarDisplay.addEventListener("click", () => avatarInput.click());
  avatarInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      localStorage.setItem("minishop_avatar", r.result);
      loadProfile();
      alert("Ảnh đại diện đã được lưu (demo)");
    };
    r.readAsDataURL(f);
  });

  // change password handler kept only if password form exists on page
  const pwForm = document.getElementById("passwordForm");
  if (pwForm) {
    pwForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const cur = document.getElementById("curPassword").value;
      const nw = document.getElementById("newPassword").value;
      const cf = document.getElementById("confirmPassword").value;
      const stored = localStorage.getItem("minishop_password") || "";
      if (stored && cur !== stored) {
        alert("Mật khẩu hiện tại không đúng (demo)");
        return;
      }
      if (!nw || nw.length < 6) {
        alert("Mật khẩu mới phải >= 6 ký tự");
        return;
      }
      if (nw !== cf) {
        alert("Mật khẩu mới và xác nhận không khớp");
        return;
      }
      localStorage.setItem("minishop_password", nw);
      alert("Mật khẩu đã được cập nhật (demo)");
      pwForm.reset();
    });
  }

  // Orders: render and add sample
  function getCurrentUserEmail() {
    return localStorage.getItem("minishop_current") || "";
  }

  function getCurrentUserOrders() {
    const email = getCurrentUserEmail();
    if (!email) return [];
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const user = users.find((u) => u.email === email);
    return user?.orders || [];
  }

  function saveCurrentUserOrders(orders) {
    const email = getCurrentUserEmail();
    if (!email) return false;
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const index = users.findIndex((u) => u.email === email);
    if (index === -1) return false;
    users[index].orders = orders;
    localStorage.setItem("minishop_users", JSON.stringify(users));
    return true;
  }

  function migrateLegacyOrders() {
    const email = getCurrentUserEmail();
    if (!email) return;
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const user = users.find((u) => u.email === email);
    const legacy = JSON.parse(localStorage.getItem("minishop_orders") || "[]");
    if (user && legacy.length && (!user.orders || !user.orders.length)) {
      user.orders = legacy;
      localStorage.setItem("minishop_users", JSON.stringify(users));
      localStorage.removeItem("minishop_orders");
    }
  }

  function loadOrders() {
    migrateLegacyOrders();
    const list = getCurrentUserOrders();
    const root = document.getElementById("ordersList");
    root.innerHTML = "";
    if (!list.length)
      root.innerHTML = '<div class="muted">Bạn chưa có đơn hàng nào.</div>';
    list.forEach((o) => {
      const el = document.createElement("div");
      el.className = "order-item";
      el.innerHTML = `<div><strong>Đơn #${o.id}</strong></div>
        <div class="meta">${o.date} — ${o.items?.length || 0} sản phẩm — Tổng: ${o.total}</div>`;
      root.appendChild(el);
    });
  }

  window.minishopAddOrder = function (order) {
    const orders = getCurrentUserOrders();
    const normalized = {
      id: order?.id || Date.now(),
      date: order?.date || new Date().toLocaleString(),
      items: order?.items || [],
      total: order?.total || "0₫",
    };
    orders.push(normalized);
    saveCurrentUserOrders(orders);
    loadOrders();
  };

  document.getElementById("addSampleOrder").addEventListener("click", () => {
    const orders = getCurrentUserOrders();
    const id = orders.length ? orders[orders.length - 1].id + 1 : 1001;
    const sample = {
      id,
      date: new Date().toLocaleString(),
      items: [{ id: 1, qty: 1 }],
      total: "129.000₫",
    };
    orders.push(sample);
    saveCurrentUserOrders(orders);
    loadOrders();
    alert("Đã lưu lịch sử mua hàng");
  });

  // Favorites: store array of ids in localStorage 'minishop_favs'
  function getFavs() {
    return JSON.parse(localStorage.getItem("minishop_favs") || "[]");
  }
  function toggleFav(id) {
    const f = getFavs();
    const i = f.indexOf(id);
    if (i > -1) f.splice(i, 1);
    else f.push(id);
    localStorage.setItem("minishop_favs", JSON.stringify(f));
    renderFavs();
  }

  function renderFavs() {
    const favs = getFavs();
    const root = document.getElementById("favoritesGrid");
    const empty = document.getElementById("favoritesEmpty");
    root.innerHTML = "";
    if (!favs.length) {
      empty.style.display = "block";
      return;
    } else empty.style.display = "none";
    (window.PRODUCTS || [])
      .filter((p) => favs.includes(p.id))
      .forEach((p) => {
        const el = document.createElement("div");
        el.className = "product";
        el.innerHTML = `
        <div class="media"><img src="${window.resolveProductImage(p.image)}" alt="${p.name}"/></div>
        <h4>${p.name}</h4>
        <div class="price">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}</div>
        <div class="actions">
          <button class="btn view" data-id="${p.id}">Xem</button>
          <button class="btn add" data-id="${p.id}">Thêm vào giỏ</button>
          <button class="btn fav" data-id="${p.id}">Bỏ thích</button>
        </div>`;
        root.appendChild(el);
      });
  }

  // handle clicks inside favorites (view/add/remove)
  document.addEventListener("click", (e) => {
    const favBtn = e.target.closest(".btn.fav");
    if (favBtn) {
      toggleFav(Number(favBtn.dataset.id));
      return;
    }
    const add = e.target.closest(".btn.add");
    if (add) {
      const id = add.dataset.id;
      const prod = (window.PRODUCTS || []).find((p) => p.id == id);
      if (!prod) return;
      const cart = JSON.parse(localStorage.getItem("minishop_cart") || "{}");
      if (cart[id]) cart[id].qty += 1;
      else cart[id] = { ...prod, qty: 1 };
      localStorage.setItem("minishop_cart", JSON.stringify(cart));
      alert("Đã thêm vào giỏ (demo)");
      return;
    }
    const view = e.target.closest(".btn.view");
    if (view) {
      window.location.href =
        "../HTML/chitietsanpham.html?id=" + view.dataset.id;
    }
  });

  // init — require login: if no current session, show prompt to login/register
  document.addEventListener("DOMContentLoaded", () => {
    const users = JSON.parse(localStorage.getItem("minishop_users") || "[]");
    const cur = localStorage.getItem("minishop_current");
    if (!cur) {
      const main =
        document.querySelector("main.container") ||
        document.querySelector("main");
      if (main) {
        const needsRegister = !users.length;
        main.innerHTML = `
          <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;padding:48px 16px">
            <div style="background:#fff;padding:28px;border-radius:10px;max-width:560px;box-shadow:0 8px 24px rgba(2,6,23,0.06);text-align:center">
              <h2 style="margin-top:0">${needsRegister ? "Bạn chưa có tài khoản" : "Yêu cầu đăng nhập"}</h2>
              <p class="muted">${needsRegister ? "Vui lòng tạo tài khoản để tiếp tục." : "Bạn cần đăng nhập để truy cập trang tài khoản."}</p>
              <div style="margin-top:18px;display:flex;gap:12px;justify-content:center">
                <a href="dangnhap.html" class="btn primary">Đăng nhập</a>
                <a href="dangky.html" class="btn">${needsRegister ? "Tạo tài khoản" : "Đăng ký"}</a>
              </div>
            </div>
          </div>`;
      }
      return;
    }

    loadProfile();
    loadOrders();
    renderFavs();
  });
})();
