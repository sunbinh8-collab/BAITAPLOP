const assert = require("assert");
const { filterProducts } = require("./timkiem.js");

const products = [
  {
    id: 1,
    name: "Áo thun Basic Trắng",
    category: "nam",
    desc: "Áo thun cotton mềm mại",
  },
  { id: 2, name: "Quần jean ôm", category: "nam", desc: "Quần jean co giãn" },
  { id: 3, name: "Váy maxi hoa", category: "nu", desc: "Váy nữ tính" },
  {
    id: 4,
    name: "Áo khoác denim",
    category: "nam",
    desc: "Áo khoác phong cách",
  },
  { id: 5, name: "Áo sơ mi caro", category: "nam", desc: "Áo sơ mi công sở" },
  {
    id: 6,
    name: "Giày sneaker trắng",
    category: "giay",
    desc: "Giày thời trang",
  },
];

assert.deepStrictEqual(
  filterProducts(products, "áo", "all").map((item) => item.id),
  [1, 4, 5],
);
assert.deepStrictEqual(
  filterProducts(products, "", "nam").map((item) => item.id),
  [1, 2, 4, 5],
);
assert.strictEqual(
  filterProducts(products, "không có sản phẩm nào", "all").length,
  0,
);

console.log("timkiem tests passed");
