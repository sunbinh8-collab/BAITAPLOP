function currency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function getCart() {
  return JSON.parse(localStorage.getItem("minishop_cart") || "{}");
}
function saveCart(cart) {
  localStorage.setItem("minishop_cart", JSON.stringify(cart));
}

function addToCart(id) {
  const product = (window.PRODUCTS || []).find((p) => p.id == id);
  if (!product) return;
  const cart = getCart();
  if (cart[id]) cart[id].qty += 1;
  else cart[id] = { ...product, qty: 1 };
  saveCart(cart);
  alert("Đã thêm vào giỏ hàng");
}

function renderDetail(id) {
  const p = (window.PRODUCTS || []).find((x) => x.id == id);
  const root = document.getElementById("productDetail");
  if (!p) {
    root.innerHTML = "<p>Sản phẩm không tồn tại.</p>";
    return;
  }
  root.innerHTML = `
		<div style="display:flex;gap:20px;flex-wrap:wrap">
			<div style="flex:1;min-width:260px"><img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:12px"/></div>
			<div style="flex:1;min-width:260px">
				<h2>${p.name}</h2>
				<div style="font-weight:700;color:var(--primary);margin:10px 0">${currency(p.price)}</div>
				<p style="color:var(--muted)">${p.desc || ""}</p>
				<div style="margin-top:18px;display:flex;gap:8px">
					<button id="addToCartBtn" class="btn add">Thêm vào giỏ</button>
					<button id="buyNow" class="btn">Mua ngay</button>
				</div>
			</div>
		</div>
	`;
  document
    .getElementById("addToCartBtn")
    .addEventListener("click", () => addToCart(id));
  document.getElementById("buyNow").addEventListener("click", () => {
    addToCart(id);
    window.location.href = "../HTML/thanhtoan.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const qp = new URLSearchParams(location.search);
  const id = Number(qp.get("id")) || 0;
  renderDetail(id);
});
