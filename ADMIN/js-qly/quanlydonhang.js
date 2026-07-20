document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const statusSelect = document.getElementById("statusSelect");
  const cards = Array.from(document.querySelectorAll(".order-card"));

  function filterOrders() {
    const keyword = (searchInput?.value || "").toLowerCase();
    const status = statusSelect?.value || "all";

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchesKeyword = text.includes(keyword);
      const matchesStatus = status === "all" || card.dataset.status === status;
      card.style.display = matchesKeyword && matchesStatus ? "" : "none";
    });
  }

  searchInput?.addEventListener("input", filterOrders);
  statusSelect?.addEventListener("change", filterOrders);
});
