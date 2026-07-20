const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Áo thun Basic Trắng",
    price: 129000,
    category: "nam",
    image: "images/giaythoitrang.jpg",
    desc: "Áo thun cotton mềm mại, thoáng mát, phù hợp đi chơi và đi làm.",
  },
  {
    id: 2,
    name: "Quần jean ôm",
    price: 299000,
    category: "nam",
    image: "images/giaythethao.jpg",
    desc: "Quần jean co giãn, may tỉ mỉ, form ôm vừa phải.",
  },
  {
    id: 3,
    name: "Váy maxi hoa",
    price: 349000,
    category: "nu",
    image: "images/vayhoa.jpg",
    desc: "Váy maxi nữ tính, họa tiết hoa nhẹ nhàng.",
  },
  {
    id: 4,
    name: "Áo khoác denim",
    price: 499000,
    category: "nam",
    image: "images/vayxoe.jpg",
    desc: "Áo khoác denim phong cách, bền màu.",
  },
  {
    id: 5,
    name: "Áo sơ mi caro",
    price: 189000,
    category: "nam",
    image: "images/vay2day.jpg",
    desc: "Áo sơ mi cắt may chuẩn, phù hợp công sở.",
  },
  {
    id: 6,
    name: "Giày sneaker trắng",
    price: 599000,
    category: "giay",
    image: "images/giaynikethethao.jpg",
    desc: "Giày sneaker thời trang, đế êm, dễ phối đồ.",
  },
];

const PRODUCT_STORAGE_KEY = "minishop_products";

function readStoredProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    console.warn("Không thể đọc dữ liệu sản phẩm từ localStorage", error);
  }
  return DEFAULT_PRODUCTS;
}

window.getProductsData = function () {
  window.PRODUCTS = readStoredProducts();
  return window.PRODUCTS;
};

window.saveProductsData = function (products) {
  const list = Array.isArray(products) ? products : [];
  window.PRODUCTS = list;
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(list));
  return window.PRODUCTS;
};

window.resolveProductImage = function (src) {
  if (!src) return src;
  if (/^data:|^https?:\/\//i.test(src) || src.startsWith("blob:")) return src;
  const needsParent =
    location.pathname.includes("/HTML/") ||
    location.pathname.includes("/html-qly/");
  return needsParent ? "../" + src : src;
};

window.PRODUCTS = window.getProductsData();
