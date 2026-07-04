(function () {
  const KEY = 'admin_products_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
  }
  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  function render() {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';
    const items = load();
    items.forEach(function (p, idx) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (p.id || idx+1) + '</td>' +
        '<td>' + (p.name || '') + '</td>' +
        '<td>' + (p.price ? Number(p.price).toLocaleString('vi-VN') : '') + '</td>' +
        '<td>' + (p.image ? ('<img src="'+p.image+'" alt="" style="height:40px">') : '') + '</td>' +
        '<td><button class="btn edit">Sửa</button> <button class="btn danger delete">Xóa</button></td>';
      tbody.appendChild(tr);
      tr.querySelector('.delete').addEventListener('click', function () {
        if (!confirm('Xóa sản phẩm này?')) return;
        items.splice(idx,1); save(items); render();
      });
      tr.querySelector('.edit').addEventListener('click', function () {
        const name = prompt('Tên sản phẩm', p.name); if (name==null) return;
        const price = prompt('Giá', p.price); if (price==null) return;
        p.name = name; p.price = Number(price);
        save(items); render();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('productForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('pName').value.trim();
        const price = Number(document.getElementById('pPrice').value) || 0;
        const image = document.getElementById('pImage').value.trim();
        const items = load();
        const id = 'P' + String(Date.now()).slice(-6);
        items.push({ id: id, name: name, price: price, image: image });
        save(items); render();
        form.reset();
      });
    }
    render();
  });
})();
