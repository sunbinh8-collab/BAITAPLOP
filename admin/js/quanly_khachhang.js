// Hàm mở modal chỉnh sửa
function editCustomer(id, name, phone, email) {
  document.getElementById('customerId').value = id;
  document.getElementById('customerName').value = name;
  document.getElementById('customerPhone').value = phone;
  document.getElementById('customerEmail').value = email;
  document.getElementById('editModal').style.display = 'block';
}

// Hàm mở modal thêm khách hàng
function openAddModal() {
  document.getElementById('addForm').reset();
  document.getElementById('addModal').style.display = 'block';
}

// Hàm đóng modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Hàm lưu dữ liệu chỉnh sửa
function saveCustomer(event) {
  event.preventDefault();
  
  const customerId = document.getElementById('customerId').value;
  const customerName = document.getElementById('customerName').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const customerEmail = document.getElementById('customerEmail').value;
  
  // Tìm và cập nhật hàng trong bảng
  const tableBody = document.getElementById('customerTableBody');
  const rows = tableBody.getElementsByTagName('tr');
  
  for (let row of rows) {
    if (row.cells[0].textContent === customerId) {
      row.cells[1].textContent = customerName;
      row.cells[2].textContent = customerPhone;
      row.cells[3].textContent = customerEmail;
      // Cập nhật nút chỉnh sửa và xóa
      row.cells[5].innerHTML = `<button class="btn-edit" onclick="editCustomer('${customerId}', '${customerName}', '${customerPhone}', '${customerEmail}')">Chỉnh sửa</button> <button class="btn-delete" onclick="deleteCustomer('${customerId}')">Xóa</button>`;
      break;
    }
  }
  
  alert('Cập nhật khách hàng thành công!');
  closeModal('editModal');
}

// Hàm thêm khách hàng mới
function addCustomer(event) {
  event.preventDefault();
  
  const customerId = document.getElementById('newCustomerId').value;
  const customerName = document.getElementById('newCustomerName').value;
  const customerPhone = document.getElementById('newCustomerPhone').value;
  const customerEmail = document.getElementById('newCustomerEmail').value;
  
  // Kiểm tra xem ID đã tồn tại chưa
  const tableBody = document.getElementById('customerTableBody');
  const rows = tableBody.getElementsByTagName('tr');
  
  for (let row of rows) {
    if (row.cells[0].textContent === customerId) {
      alert('ID khách hàng này đã tồn tại!');
      return;
    }
  }
  
  // Tạo hàng mới
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${customerId}</td>
    <td>${customerName}</td>
    <td>${customerPhone}</td>
    <td>${customerEmail}</td>
    <td>0₫</td>
    <td><button class="btn-edit" onclick="editCustomer('${customerId}', '${customerName}', '${customerPhone}', '${customerEmail}')">Chỉnh sửa</button> <button class="btn-delete" onclick="deleteCustomer('${customerId}')">Xóa</button></td>
  `;
  
  tableBody.appendChild(newRow);
  alert('Thêm khách hàng thành công!');
  closeModal('addModal');
}

// Hàm xóa khách hàng
function deleteCustomer(id) {
  if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
    const tableBody = document.getElementById('customerTableBody');
    const rows = tableBody.getElementsByTagName('tr');
    
    for (let row of rows) {
      if (row.cells[0].textContent === id) {
        tableBody.removeChild(row);
        alert('Xóa khách hàng thành công!');
        break;
      }
    }
  }
}

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
  const editModal = document.getElementById('editModal');
  const addModal = document.getElementById('addModal');
  if (event.target === editModal) {
    editModal.style.display = 'none';
  }
  if (event.target === addModal) {
    addModal.style.display = 'none';
  }
}
