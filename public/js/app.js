/**
 * APP.JS - Utilidades Globais do Sistema
 */

// 1. Formatação de Moeda (Kwanza - AOA)
function formatKz(valor) {
  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" })
    .format(valor || 0)
    .replace("AOA", "Kz");
}

// 2. Formatação de Datas
function formatData(dataISO) {
  if (!dataISO) return "-";
  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 3. Abrir e Fechar Modais Genericamente
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle("hidden");
  }
}

// 4. Fechar modal ao clicar fora da caixa (no fundo escuro)
window.addEventListener("click", function (event) {
  if (
    event.target.classList.contains("backdrop-blur-sm") ||
    event.target.classList.contains("bg-slate-900/50")
  ) {
    event.target.classList.add("hidden");
  }
});

// 5. Destacar link ativo na Sidebar automaticamente baseado na URL atual
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("aside nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.className =
        "flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium transition";
    } else {
      link.className =
        "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white font-medium transition";
    }
  });
});
