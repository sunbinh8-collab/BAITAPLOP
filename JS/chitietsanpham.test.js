const assert = require("assert");
const {
  getProductReviews,
  getProductDescription,
} = require("./chitietsanpham.js");

const product = {
  id: 1,
  name: "Áo thun Basic Trắng",
  category: "nam",
  desc: "Áo thun cotton mềm mại",
};

const description = getProductDescription(product);
const reviews = getProductReviews(product);

assert.ok(description.includes("mềm mại") || description.includes("thoáng"));
assert.ok(Array.isArray(reviews));
assert.ok(reviews.length > 0);
assert.ok(reviews[0].name);

console.log("chitietsanpham tests passed");
