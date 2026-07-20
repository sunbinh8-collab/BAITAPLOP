document.addEventListener("DOMContentLoaded", () => {
  const rows = Array.from(document.querySelectorAll("tbody tr"));
  const searchInput = document.getElementById("searchInput");
  const periodSelect = document.getElementById("periodSelect");

  function filterRows() {
    const keyword = (searchInput?.value || "").toLowerCase();
    const period = periodSelect?.value || "all";

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const matchesKeyword = text.includes(keyword);
      const matchesPeriod = period === "all" || row.dataset.period === period;
      row.style.display = matchesKeyword && matchesPeriod ? "" : "none";
    });
  }

  searchInput?.addEventListener("input", filterRows);
  periodSelect?.addEventListener("change", filterRows);
});
