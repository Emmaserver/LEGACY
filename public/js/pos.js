/**
 * POS.JS - Lógica do Ponto de Venda e Carrinho
 */

// Estado da Aplicação POS
let catalogoPOS = [
  {
    id: 1,
    sku: "CIM-001",
    nome: "Cimento Secil 50kg",
    categoria: "Cimento",
    unidade: "Saco",
    preco: 5500,
    stock: 120,
  },
  {
    id: 2,
    sku: "FER-012",
    nome: "Varão de Aço 12mm",
    categoria: "Ferragens",
    unidade: "Vara",
    preco: 4200,
    stock: 8,
  },
  {
    id: 3,
    sku: "TNT-001",
    nome: "Tinta Acrílica 18L",
    categoria: "Tintas",
    unidade: "Lata",
    preco: 28500,
    stock: 25,
  },
  {
    id: 4,
    sku: "AGR-005",
    nome: "Areia Fina (m³)",
    categoria: "Agregados",
    unidade: "m³",
    preco: 15000,
    stock: 40,
  },
  {
    id: 5,
    sku: "TUB-020",
    nome: "Tubo PVC 110mm",
    categoria: "Tubos",
    unidade: "Unidade",
    preco: 3800,
    stock: 60,
  },
];

let carrinho = [];
let metodoPagamento = "Numerário";

// Inicializar ecran POS
document.addEventListener("DOMContentLoaded", function () {
  renderizarCatalogo(catalogoPOS);
  renderizarCarrinho();
});

// Renderizar Produtos no Grid
function renderizarCatalogo(produtos) {
  const grid = document.getElementById("grid-produtos");
  if (!grid) return;

  if (produtos.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-12 text-center text-gray-400">Nenhum produto encontrado.</div>`;
    return;
  }

  let html = "";
  produtos.forEach((prod) => {
    const semStock = prod.stock <= 0;
    const opacityClass = semStock
      ? "opacity-50 cursor-not-allowed"
      : "hover:border-indigo-500 cursor-pointer hover:shadow-md";

    html += `
            <div onclick="${semStock ? "" : `adicionarAoCarrinho(${prod.id})`}" class="bg-white p-4 rounded-xl border border-gray-200 transition flex flex-col justify-between ${opacityClass}">
                <div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">${prod.categoria}</span>
                    <h4 class="font-semibold text-gray-800 text-sm leading-snug mt-1">${prod.nome}</h4>
                    <p class="text-xs text-gray-400 mt-0.5">SKU: ${prod.sku}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-end">
                    <div>
                        <p class="text-xs text-gray-400">Stock: ${prod.stock}</p>
                        <p class="font-bold text-indigo-600 text-sm">${formatKz(prod.preco)}</p>
                    </div>
                    <button class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition">
                        <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                </div>
            </div>`;
  });

  grid.innerHTML = html;
}

// Filtrar Produtos por Texto e Categoria
function filtrarProdutosPOS() {
  const busca = document.getElementById("pos-busca").value.toLowerCase();
  const categoria = document.getElementById("pos-categoria").value;

  const filtrados = catalogoPOS.filter((prod) => {
    const bateBusca =
      prod.nome.toLowerCase().includes(busca) ||
      prod.sku.toLowerCase().includes(busca);
    const bateCategoria = categoria === "" || prod.categoria === categoria;
    return bateBusca && bateCategoria;
  });

  renderizarCatalogo(filtrados);
}

// Adicionar Item ao Carrinho
function adicionarAoCarrinho(produtoId) {
  const produto = catalogoPOS.find((p) => p.id === produtoId);
  if (!produto) return;

  const itemExistente = carrinho.find((item) => item.id === produtoId);

  if (itemExistente) {
    if (itemExistente.qtd + 1 > produto.stock) {
      alert("Quantidade solicitada excede o stock disponível!");
      return;
    }
    itemExistente.qtd += 1;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      qtd: 1,
      stockMax: produto.stock,
    });
  }

  renderizarCarrinho();
}

// Alterar Quantidade de um Item
function alterarQuantidade(produtoId, delta) {
  const item = carrinho.find((i) => i.id === produtoId);
  if (!item) return;

  const novaQtd = item.qtd + delta;

  if (novaQtd > item.stockMax) {
    alert("Limite do stock atingido!");
    return;
  }

  if (novaQtd <= 0) {
    removerDoCarrinho(produtoId);
  } else {
    item.qtd = novaQtd;
    renderizarCarrinho();
  }
}

// Remover Item do Carrinho
function removerDoCarrinho(produtoId) {
  carrinho = carrinho.filter((i) => i.id !== produtoId);
  renderizarCarrinho();
}

// Limpar todo o Carrinho
function limparCarrinho() {
  carrinho = [];
  renderizarCarrinho();
}

// Renderizar Lista e Totais do Carrinho
function renderizarCarrinho() {
  const container = document.getElementById("lista-carrinho");
  if (!container) return;

  if (carrinho.length === 0) {
    container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-400 text-center py-12">
                <i class="fa-solid fa-basket-shopping text-4xl mb-2 text-gray-300"></i>
                <p class="text-sm">Carrinho vazio</p>
                <p class="text-xs text-gray-400">Clique num produto para adicionar</p>
            </div>`;
    atualizarTotais();
    return;
  }

  let html = "";
  carrinho.forEach((item) => {
    const subtotalItem = item.preco * item.qtd;
    html += `
            <div class="py-3 flex items-center justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <h5 class="text-sm font-semibold text-gray-800 truncate">${item.nome}</h5>
                    <p class="text-xs text-gray-500">${formatKz(item.preco)} un.</p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                        <button onclick="alterarQuantidade(${item.id}, -1)" class="px-2 py-1 hover:bg-gray-200 text-gray-600 text-xs font-bold">-</button>
                        <span class="px-2 py-1 text-xs font-bold text-gray-800 min-w-[24px] text-center">${item.qtd}</span>
                        <button onclick="alterarQuantidade(${item.id}, 1)" class="px-2 py-1 hover:bg-gray-200 text-gray-600 text-xs font-bold">+</button>
                    </div>
                    <span class="text-sm font-bold text-gray-800 w-20 text-right">${formatKz(subtotalItem)}</span>
                    <button onclick="removerDoCarrinho(${item.id})" class="text-gray-400 hover:text-rose-600 p-1">
                        <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>
            </div>`;
  });

  container.innerHTML = html;
  atualizarTotais();
}

// Atualizar Totais da Venda
function atualizarTotais() {
  const total = carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  document.getElementById("pos-subtotal").innerText = formatKz(total);
  document.getElementById("pos-total").innerText = formatKz(total);
}

// Selecionar Método de Pagamento
function selecionarMetodo(metodo) {
  metodoPagamento = metodo;
  document.querySelectorAll(".btn-metodo").forEach((btn) => {
    btn.className =
      "btn-metodo border text-xs py-2 rounded-lg font-medium border-gray-200 hover:bg-gray-100 text-gray-700";
  });

  const btnAtivo = document.getElementById(`btn-metodo-${metodo}`);
  if (btnAtivo) {
    btnAtivo.className =
      "btn-metodo border text-xs py-2 rounded-lg font-medium border-indigo-600 bg-indigo-50 text-indigo-700";
  }
}

// Finalizar Venda
function finalizarVenda() {
  if (carrinho.length === 0) {
    alert(
      "Adicione pelo menos um produto ao carrinho antes de emitir a venda.",
    );
    return;
  }

  const clienteSelect = document.getElementById("select-cliente");
  const clienteNome = clienteSelect.options[clienteSelect.selectedIndex].text;
  const totalVenda = carrinho.reduce(
    (acc, item) => acc + item.preco * item.qtd,
    0,
  );

  // Abater do stock local simulado
  carrinho.forEach((itemCarrinho) => {
    const prod = catalogoPOS.find((p) => p.id === itemCarrinho.id);
    if (prod) {
      prod.stock -= itemCarrinho.qtd;
    }
  });

  alert(
    `Venda concluída com sucesso!\n\nCliente: ${clienteNome}\nTotal: ${formatKz(totalVenda)}\nPagamento: ${metodoPagamento}`,
  );

  // Limpar o estado
  limparCarrinho();
  renderizarCatalogo(catalogoPOS);
}
