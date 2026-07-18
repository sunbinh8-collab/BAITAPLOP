function currency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function getProductDescription(product) {
  if (!product)
    return "Sản phẩm chất lượng tốt, phù hợp cho nhiều phong cách thời trang.";

  const baseDescriptions = {
    nam: "Sản phẩm dành cho nam giới với chất liệu thoáng mát, đường may tinh tế và form dáng hiện đại.",
    nu: "Sản phẩm dành cho nữ giới với thiết kế nhẹ nhàng, nữ tính và dễ phối cùng nhiều phụ kiện.",
    giay: "Sản phẩm giày với đế êm, bền đẹp và phù hợp cho di chuyển hàng ngày.",
  };

  return `${product.desc || "Sản phẩm thời trang phong cách hiện đại."} ${baseDescriptions[product.category] || "Thiết kế tiện lợi, phù hợp cho nhiều hoàn cảnh."}`;
}

function getProductReviews(product) {
  const fallbackReviews = [
    {
      name: "Lan",
      rating: 5,
      text: "Chất liệu mềm mại, mặc rất thoải mái.",
    },
    {
      name: "Minh",
      rating: 4,
      text: "Thiết kế đẹp, giá hợp lý và giao hàng nhanh.",
    },
  ];

  if (!product) return fallbackReviews;

  const savedReviews = JSON.parse(
    localStorage.getItem("minishop_reviews") || "{}",
  );
  const productReviews = savedReviews[product.id] || [];

  if (product.id === 1) {
    return [
      ...[
        {
          name: "Hương",
          rating: 5,
          text: "Áo vừa vặn, chất cotton mềm và dễ phối đồ.",
        },
        {
          name: "Đức",
          rating: 4,
          text: "Màu sắc đẹp, phù hợp đi làm và đi chơi.",
        },
      ],
      ...productReviews,
    ];
  }

  if (product.id === 3) {
    return [
      ...[
        {
          name: "Mai",
          rating: 5,
          text: "Váy rất xinh, chất vải mịn và thoải mái.",
        },
        { name: "Nhi", rating: 5, text: "Đẹp, nhẹ và phù hợp cho nhiều dịp." },
      ],
      ...productReviews,
    ];
  }

  return [...fallbackReviews, ...productReviews];
}

function saveReview(productId, review) {
  const savedReviews = JSON.parse(
    localStorage.getItem("minishop_reviews") || "{}",
  );
  const list = savedReviews[productId] || [];
  list.unshift(review);
  savedReviews[productId] = list;
  localStorage.setItem("minishop_reviews", JSON.stringify(savedReviews));
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
  const description = getProductDescription(p);
  const reviews = getProductReviews(p);

  root.innerHTML = `
    <div class="product-detail-card">
      <div class="product-main">
        <div class="product-media">
          <img src="${window.resolveProductImage(p.image)}" alt="${p.name}" />
        </div>
        <div class="product-info">
          <h2>${p.name}</h2>
          <div class="product-price">${currency(p.price)}</div>
          <p style="color:var(--muted)">${description}</p>
          <div class="product-actions">
            <button id="addToCartBtn" class="btn add">Thêm vào giỏ</button>
            <button id="buyNow" class="btn">Mua ngay</button>
          </div>
        </div>
      </div>

      <section class="detail-section">
        <h3>Mô tả sản phẩm</h3>
        <p>${description}</p>
      </section>

      <section class="detail-section">
        <h3>Đánh giá khách hàng</h3>
        <form id="reviewForm" class="review-form">
          <input id="reviewName" type="text" placeholder="Tên của bạn" required />
          <select id="reviewRating">
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <textarea id="reviewText" rows="3" placeholder="Nhận xét của bạn..." required></textarea>
          <button type="submit" class="btn add">Gửi đánh giá</button>
        </form>
        <div class="review-list">
          ${reviews
            .map(
              (review) => `
            <div class="review-item">
              <strong>${review.name}</strong>
              <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
              <div class="review-meta">${review.rating}/5 sao</div>
              <div>${review.text}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
  document
    .getElementById("addToCartBtn")
    .addEventListener("click", () => addToCart(id));
  document.getElementById("buyNow").addEventListener("click", () => {
    addToCart(id);
    window.location.href = "../HTML/thanhtoan.html";
  });

  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("reviewName").value.trim();
      const rating = Number(document.getElementById("reviewRating").value);
      const text = document.getElementById("reviewText").value.trim();

      if (!name || !text) return;

      saveReview(id, { name, rating, text });
      reviewForm.reset();
      renderDetail(id);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const qp = new URLSearchParams(location.search);
  const id = Number(qp.get("id")) || 0;
  renderDetail(id);
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getProductDescription, getProductReviews };
}
