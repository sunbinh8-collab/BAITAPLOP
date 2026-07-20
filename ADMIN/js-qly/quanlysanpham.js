document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const productList = document.getElementById("productList");
  const form = document.getElementById("productForm");
  const idInput = document.getElementById("productId");
  const nameInput = document.getElementById("name");
  const priceInput = document.getElementById("price");
  const categoryInput = document.getElementById("category");
  const stockInput = document.getElementById("stock");
  const statusInput = document.getElementById("status");
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("imagePreview");
  const categoryFilter = document.getElementById("categoryFilter");
  const statusFilter = document.getElementById("statusFilter");
  const cancelEdit = document.getElementById("cancelEdit");

  const getProducts = () => {
    if (window.getProductsData) return window.getProductsData();
    return JSON.parse(localStorage.getItem("minishop_products") || "[]");
  };
  const saveProducts = (products) => {
    if (window.saveProductsData) {
      window.saveProductsData(products);
      return;
    }
    localStorage.setItem("minishop_products", JSON.stringify(products));
  };

  function renderProducts() {
    const products = getProducts();
    const keyword = (searchInput?.value || "").toLowerCase();
    const selectedCategory = categoryFilter?.value || "all";
    const selectedStatus = statusFilter?.value || "all";
    const filtered = products.filter((item) => {
      const text = `${item.name} ${item.category}`.toLowerCase();
      const matchesKeyword = text.includes(keyword);
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      return matchesKeyword && matchesCategory && matchesStatus;
    });

    if (!productList) return;
    if (!filtered.length) {
      productList.innerHTML = '<div class="muted">Không có sản phẩm nào.</div>';
      return;
    }

    productList.innerHTML = filtered
      .map(
        (item) => `
      <div class="product-card">
        <div class="product-row">
          ${item.image ? `<img class="product-thumb" src="${window.resolveProductImage ? window.resolveProductImage(item.image) : item.image}" alt="${item.name}" />` : '<div class="product-thumb" style="background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#64748b;">ẢNH</div>'}
          <div class="product-info">
            <strong>${item.name}</strong>
            <span>Danh mục: ${item.category}</span>
            <span>Giá: ${Number(item.price).toLocaleString("vi-VN")}₫</span>
            <span>Tồn kho: ${item.stock}</span>
            <span class="badge ${item.status === "out-of-stock" ? "out" : ""}">${item.status === "out-of-stock" ? "Hết hàng" : "Còn hàng"}</span>
          </div>
        </div>
        <div class="product-actions">
          <button type="button" class="secondary edit-btn" data-id="${item.id}">Sửa</button>
          <button type="button" class="danger delete-btn" data-id="${item.id}">Xóa</button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  function resetForm() {
    form.reset();
    idInput.value = "";
    statusInput.value = "in-stock";
    imageInput.value = "";
    if (imagePreview) imagePreview.innerHTML = "Ảnh";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const products = getProducts();

    const submitPayload = (imageData = "") => {
      const payload = {
        id: idInput.value || Date.now().toString(),
        name: nameInput.value.trim(),
        price: priceInput.value.trim(),
        category: categoryInput.value.trim(),
        stock: stockInput.value.trim(),
        status: statusInput.value,
        image:
          imageData ||
          products.find((item) => item.id === (idInput.value || ""))?.image ||
          "",
      };

      if (
        !payload.name ||
        !payload.price ||
        !payload.category ||
        !payload.stock
      )
        return;

      const existingIndex = products.findIndex(
        (item) => item.id === payload.id,
      );
      if (existingIndex >= 0) products[existingIndex] = payload;
      else products.push(payload);

      saveProducts(products);
      renderProducts();
      resetForm();
    };

    if (imageInput.files && imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = () => submitPayload(reader.result);
      reader.readAsDataURL(imageInput.files[0]);
      return;
    }

    submitPayload();
  });

  imageInput?.addEventListener("change", () => {
    if (!imagePreview) return;
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      imagePreview.innerHTML = "Ảnh";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.innerHTML = `<img src="${reader.result}" alt="preview" />`;
    };
    reader.readAsDataURL(file);
  });

  cancelEdit.addEventListener("click", resetForm);

  productList.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      const products = getProducts();
      const item = products.find((entry) => entry.id === editBtn.dataset.id);
      if (!item) return;
      idInput.value = item.id;
      nameInput.value = item.name;
      priceInput.value = item.price;
      categoryInput.value = item.category;
      stockInput.value = item.stock;
      statusInput.value = item.status || "in-stock";
      nameInput.focus();
    }

    if (deleteBtn) {
      const products = getProducts().filter(
        (entry) => entry.id !== deleteBtn.dataset.id,
      );
      saveProducts(products);
      renderProducts();
    }
  });

  searchInput?.addEventListener("input", renderProducts);
  categoryFilter?.addEventListener("change", renderProducts);
  statusFilter?.addEventListener("change", renderProducts);

  if (!getProducts().length) {
    saveProducts([
      {
        id: "1",
        name: "Áo thun nam",
        price: "199000",
        category: "Thời trang",
        stock: "25",
        status: "in-stock",
      },
      {
        id: "2",
        name: "Quần jean",
        price: "350000",
        category: "Thời trang",
        stock: "18",
        status: "in-stock",
      },
      {
        id: "3",
        name: "Túi xách",
        price: "280000",
        category: "Phụ kiện",
        stock: "0",
        status: "out-of-stock",
      },
    ]);
  }

  renderProducts();
});
