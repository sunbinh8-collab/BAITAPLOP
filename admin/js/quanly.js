(function () {
  function formatVND(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }

  function computeTotals(filter) {
    const rows = Array.from(document.querySelectorAll('#ordersTable tbody tr'));
    let total = 0;
    let count = 0;
    rows.forEach(function (tr) {
      const amount = parseFloat(tr.dataset.amount) || 0;
      const status = tr.dataset.status || '';
      const dateStr = tr.dataset.date || '';
      let include = true;
      if (filter.status && filter.status !== 'all') include = include && status === filter.status;
      if (filter.from) include = include && new Date(dateStr) >= new Date(filter.from);
      if (filter.to) include = include && new Date(dateStr) <= new Date(filter.to);
      if (include) {
        total += amount;
        count++;
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
    const totalEl = document.getElementById('totalRevenue');
    const countEl = document.getElementById('orderCount');
    if (totalEl) totalEl.textContent = formatVND(total);
    if (countEl) countEl.textContent = count;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // initial compute
    computeTotals({ status: 'all' });

    const filterBtn = document.getElementById('filterBtn');
    const resetBtn = document.getElementById('resetBtn');
    if (filterBtn) {
      filterBtn.addEventListener('click', function () {
        const status = document.getElementById('statusFilter').value;
        const from = document.getElementById('fromDate').value;
        const to = document.getElementById('toDate').value;
        computeTotals({ status: status, from: from, to: to });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('fromDate').value = '';
        document.getElementById('toDate').value = '';
        computeTotals({ status: 'all' });
      });
    }
  });
})();
