(function () {
  const STORAGE_KEY = 'admin_staff_v1';

  function loadStaff() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveStaff(staff) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
  }

  function renderStaff() {
    const tbody = document.querySelector('#staffTable tbody');
    tbody.innerHTML = '';
    const staff = loadStaff();

    if (staff.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Chưa có nhân viên nào.</td></tr>';
      return;
    }

    staff.forEach(function (employee, index) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + employee.id + '</td>' +
        '<td>' + employee.name + '</td>' +
        '<td>' + employee.role + '</td>' +
        '<td>' + employee.email + '</td>' +
        '<td>' +
        '<button class="btn edit">Sửa</button> ' +
        '<button class="btn danger delete">Xóa</button>' +
        '</td>';
      tbody.appendChild(tr);

      tr.querySelector('.edit').addEventListener('click', function () {
        const name = prompt('Tên nhân viên', employee.name);
        if (name === null) return;
        const role = prompt('Chức vụ', employee.role);
        if (role === null) return;
        const email = prompt('Email', employee.email);
        if (email === null) return;

        employee.name = name.trim();
        employee.role = role.trim();
        employee.email = email.trim();
        saveStaff(staff);
        renderStaff();
      });

      tr.querySelector('.delete').addEventListener('click', function () {
        if (!confirm('Xóa nhân viên này?')) return;
        staff.splice(index, 1);
        saveStaff(staff);
        renderStaff();
      });
    });
  }

  function generateId() {
    return 'NV' + Date.now().toString().slice(-5);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('staffForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = document.getElementById('staffName').value.trim();
      const role = document.getElementById('staffRole').value.trim();
      const email = document.getElementById('staffEmail').value.trim();
      if (!name || !role || !email) return;

      const staff = loadStaff();
      staff.push({ id: generateId(), name: name, role: role, email: email });
      saveStaff(staff);
      renderStaff();
      form.reset();
    });

    renderStaff();
  });
})();
