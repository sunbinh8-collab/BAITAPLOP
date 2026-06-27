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
})();
