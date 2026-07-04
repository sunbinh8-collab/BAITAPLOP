(function () {
  const KEY = 'admin_products_v1';
  let filteredCategory = 'Thời trang'; // Mặc định chỉ hiển thị Thời trang

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
  }
  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  function render() {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';
    const items = load();
    
    items.forEach(function (p, idx) {
      // Lọc theo danh mục nếu có lựa chọn
      if (filteredCategory && p.category !== filteredCategory) {
        return;
      }
      
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (p.id || idx+1) + '</td>' +
        '<td>' + (p.name || '') + '</td>' +
        '<td>' + (p.price ? Number(p.price).toLocaleString('vi-VN') : '') + '</td>' +
        '<td><span class="category-badge" style="background-color: #007bff; color: white; padding: 4px 8px; border-radius: 4px;">' + (p.category || 'Khác') + '</span></td>' +
        '<td>' + (p.image ? ('<img src="'+p.image+'" alt="" style="height:40px">') : '') + '</td>' +
        '<td><button class="btn edit">Sửa</button> <button class="btn danger delete">Xóa</button></td>';
      tbody.appendChild(tr);
      
      tr.querySelector('.delete').addEventListener('click', function () {
        if (!confirm('Xóa sản phẩm này?')) return;
        items.splice(idx,1); 
        save(items); 
        render();
      });
      
      tr.querySelector('.edit').addEventListener('click', function () {
        const name = prompt('Tên sản phẩm', p.name); if (name==null) return;
        const price = prompt('Giá', p.price); if (price==null) return;
        const category = prompt('Danh mục (Điện tử/Thời trang/Thực phẩm/Sách/Khác)', p.category || 'Khác');
        if (category==null) return;
        
        p.name = name; 
        p.price = Number(price);
        p.category = category;
        save(items); 
        render();
      });
    });
    
    // Hiển thị thông báo nếu không có sản phẩm
    if (tbody.children.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px;">Không có sản phẩm nào</td>';
      tbody.appendChild(tr);
    }
  }

  window.filterByCategory = function() {
    const select = document.getElementById('categoryFilter');
    filteredCategory = select.value;
    render();
  };

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('productForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('pName').value.trim();
        const price = Number(document.getElementById('pPrice').value) || 0;
        const category = document.getElementById('pCategory').value.trim();
        const image = document.getElementById('pImage').value.trim();
        
        if (!name || !category) {
          alert('Vui lòng nhập đầy đủ tên sản phẩm và danh mục!');
          return;
        }
        
        const items = load();
        const id = 'P' + String(Date.now()).slice(-6);
        items.push({ id: id, name: name, price: price, category: category, image: image });
        save(items); 
        render();
        form.reset();
        
        alert('Thêm sản phẩm thành công!');
      });
    }
    render();
  });
})();
