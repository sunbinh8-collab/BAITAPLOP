document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const staffList = document.getElementById("staffList");
  const form = document.getElementById("staffForm");
  const idInput = document.getElementById("staffId");
  const nameInput = document.getElementById("name");
  const roleInput = document.getElementById("role");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const joinDateInput = document.getElementById("joinDate");
  const statusInput = document.getElementById("status");
  const permissionInput = document.getElementById("permission");
  const photoInput = document.getElementById("photo");
  const cancelEdit = document.getElementById("cancelEdit");

  const getStaff = () =>
    JSON.parse(localStorage.getItem("minishop_staff") || "[]");

  function saveStaff(staff) {
    localStorage.setItem("minishop_staff", JSON.stringify(staff));
  }

  function renderStaff() {
    const staff = getStaff();
    const keyword = (searchInput?.value || "").toLowerCase();
    const filtered = staff.filter((item) => {
      const text = `${item.name} ${item.role} ${item.email}`.toLowerCase();
      return text.includes(keyword);
    });

    if (!staffList) return;
    if (!filtered.length) {
      staffList.innerHTML = '<div class="muted">Không có nhân viên nào.</div>';
      return;
    }

    staffList.innerHTML = filtered
      .map(
        (item) => `
      <div class="staff-card">
        <div class="staff-main" style="display:flex;align-items:center;flex-direction:row;">
          ${item.photo ? `<img class="staff-avatar" src="${item.photo}" alt="${item.name}" />` : '<div class="staff-avatar" style="background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#64748b;">ẢNH</div>'}
          <div>
            <strong>${item.name}</strong>
            <span>${item.role}</span>
            <span>${item.email}</span>
          </div>
        </div>
        <div class="staff-info">
          <strong>Thông tin</strong><br />
          <span>Điện thoại: ${item.phone || "Chưa cập nhật"}</span><br />
          <span>Ngày vào làm: ${item.joinDate || "Chưa cập nhật"}</span><br />
          <span class="badge ${item.status === "off" ? "off" : "active"}">${item.status === "off" ? "Nghỉ phép" : "Đang làm việc"}</span>
          <span class="badge" style="margin-left:6px;background:#e0f2fe;color:#0369a1;">${item.permission === "admin" ? "Admin" : "Nhân viên"}</span>
          <div style="margin-top:8px;display:flex;gap:8px">
            <button type="button" class="secondary edit-btn" data-id="${item.id}">Sửa</button>
            <button type="button" class="danger delete-btn" data-id="${item.id}">Xóa</button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }

  function resetForm() {
    form.reset();
    idInput.value = "";
    statusInput.value = "active";
    permissionInput.value = "staff";
    photoInput.value = "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const staff = getStaff();
    const photo =
      photoInput.files && photoInput.files[0]
        ? (() => {
            const reader = new FileReader();
            const result = [];
            reader.onload = () => {
              const payload = {
                id: idInput.value || Date.now().toString(),
                name: nameInput.value.trim(),
                role: roleInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                joinDate: joinDateInput.value.trim(),
                status: statusInput.value,
                permission: permissionInput.value,
                photo: reader.result,
              };
              const existingIndex = staff.findIndex(
                (item) => item.id === payload.id,
              );
              if (existingIndex >= 0) staff[existingIndex] = payload;
              else staff.push(payload);
              saveStaff(staff);
              renderStaff();
              resetForm();
            };
            reader.readAsDataURL(photoInput.files[0]);
            return null;
          })()
        : null;

    if (photo !== null) return;

    const payload = {
      id: idInput.value || Date.now().toString(),
      name: nameInput.value.trim(),
      role: roleInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      joinDate: joinDateInput.value.trim(),
      status: statusInput.value,
      permission: permissionInput.value,
      photo:
        staff.find((item) => item.id === (idInput.value || ""))?.photo || "",
    };

    if (!payload.name || !payload.role || !payload.email) return;

    const existingIndex = staff.findIndex((item) => item.id === payload.id);
    if (existingIndex >= 0) staff[existingIndex] = payload;
    else staff.push(payload);

    saveStaff(staff);
    renderStaff();
    resetForm();
  });

  cancelEdit.addEventListener("click", resetForm);

  staffList.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      const staff = getStaff();
      const item = staff.find((entry) => entry.id === editBtn.dataset.id);
      if (!item) return;
      idInput.value = item.id;
      nameInput.value = item.name;
      roleInput.value = item.role;
      emailInput.value = item.email;
      phoneInput.value = item.phone || "";
      joinDateInput.value = item.joinDate || "";
      statusInput.value = item.status || "active";
      permissionInput.value = item.permission || "staff";
      nameInput.focus();
    }

    if (deleteBtn) {
      const staff = getStaff().filter(
        (entry) => entry.id !== deleteBtn.dataset.id,
      );
      saveStaff(staff);
      renderStaff();
    }
  });

  searchInput?.addEventListener("input", renderStaff);

  if (!getStaff().length) {
    saveStaff([
      {
        id: "1",
        name: "Nguyễn Minh",
        role: "Quản lý kho",
        email: "minh.nguyen@email.com",
        phone: "0909123456",
        joinDate: "01/03/2024",
        status: "active",
        permission: "admin",
      },
      {
        id: "2",
        name: "Trần Lan",
        role: "Nhân viên bán hàng",
        email: "lan.tran@email.com",
        phone: "0911222333",
        joinDate: "10/05/2024",
        status: "active",
        permission: "staff",
      },
      {
        id: "3",
        name: "Phạm Huy",
        role: "Chăm sóc khách hàng",
        email: "huy.pham@email.com",
        phone: "0988777666",
        joinDate: "20/08/2023",
        status: "off",
        permission: "staff",
      },
    ]);
  }

  renderStaff();
});
