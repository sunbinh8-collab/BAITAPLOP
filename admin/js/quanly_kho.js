(function () {
  const KEY = 'admin_inventory_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('vi-VN');
  }

  function render() {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';
    const items = load();
    items.forEach(function (item, idx) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + item.id + '</td>' +
        '<td>' + item.name + '</td>' +
        '<td>' + formatNumber(item.quantity) + '</td>' +
        '<td>' + item.location + '</td>' +
        '<td><button class="btn edit">Sửa</button> <button class="btn danger delete">Xóa</button></td>';
      tbody.appendChild(tr);

      tr.querySelector('.edit').addEventListener('click', function () {
        const quantity = prompt('Số lượng mới cho ' + item.name + ':', item.quantity);
        if (quantity === null) return;
        const parsed = Number(quantity);
        if (Number.isNaN(parsed) || parsed < 0) {
          alert('Vui lòng nhập số nguyên dương.');
          return;
        }
        item.quantity = parsed;
        save(items);
        render();
      });

      tr.querySelector('.delete').addEventListener('click', function () {
        if (!confirm('Xóa sản phẩm kho này?')) return;
        items.splice(idx, 1);
        save(items);
        render();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('inventoryForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('inventoryName').value.trim();
        const quantity = Number(document.getElementById('inventoryQuantity').value);
        const location = document.getElementById('inventoryLocation').value.trim();
        if (!name || Number.isNaN(quantity) || quantity < 0 || !location) {
          alert('Vui lòng điền tên, số lượng và vị trí hợp lệ.');
          return;
        }
        const items = load();
        const id = 'K' + String(Date.now()).slice(-5);
        items.push({ id: id, name: name, quantity: quantity, location: location });
        save(items);
        form.reset();
        render();
      });
    }

    render();
  });
})();
