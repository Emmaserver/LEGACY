/**
 * PRODUTOS.JS - Gestão de Produtos e Stock
 */

// Estado Local dos Produtos (Mock Data)
let produtos = [
  {
    id: 1,
    sku: "CIM-001",
    nome: "Cimento Secil 50kg",
    categoria: "Cimento",
    unidade: "Saco",
    preco: 5500,
    stock: 120,
    stockMinimo: 15,
  },
  {
    id: 2,
    sku: "FER-012",
    nome: "Varão de Aço 12mm",
    categoria: "Ferragens",
    unidade: "Vara",
    preco: 4200,
    stock: 8,
    stockMinimo: 10,
  },
  {
    id: 3,
    sku: "TNT-001",
    nome: "Tinta Acrílica Branca 18L",
    categoria: "Tintas",
    unidade: "Lata",
    preco: 28500,
    stock: 25,
    stockMinimo: 5,
  },
];

// Carregar tabela ao inicializar a página
document.addEventListener("DOMContentLoaded", function () {
  renderizarTabela(produtos);
});

// Renderizar Tabela na Interface
function renderizarTabela(listaProdutos) {
  const tbody = document.getElementById("tabela-produtos-body");
  if (!tbody) return;

  if (listaProdutos.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-400">
                    Nenhum produto encontrado.
                </td>
            </tr>`;
    return;
  }

  let html = "";

  listaProdutos.forEach((prod) => {
    // Verifica alerta de stock baixo
    const isStockBaixo = prod.stock <= prod.stockMinimo;
    const statusBadge = isStockBaixo
      ? `<span class="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">Stock Baixo</span>`
      : `<span class="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">Normal</span>`;

    const stockTextClass = isStockBaixo
      ? "text-amber-600 font-bold"
      : "font-semibold";

    html += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-900">${prod.nome}</div>
                    <div class="text-xs text-gray-400">SKU: ${prod.sku}</div>
                </td>
                <td class="px-6 py-4">${prod.categoria}</td>
                <td class="px-6 py-4 text-gray-500">${prod.unidade}</td>
                <td class="px-6 py-4 font-medium">${formatKz(prod.preco)}</td>
                <td class="px-6 py-4 ${stockTextClass}">${prod.stock} ${prod.unidade}s</td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="editarProduto(${prod.id})" title="Editar" class="text-gray-400 hover:text-indigo-600 transition">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="eliminarProduto(${prod.id})" title="Eliminar" class="text-gray-400 hover:text-rose-600 transition">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>`;
  });

  tbody.innerHTML = html;
}

// Filtrar Produtos por Texto de Pesquisa e Categoria
function filtrarProdutos() {
  const busca = document.getElementById("input-busca").value.toLowerCase();
  const categoria = document.getElementById("select-categoria").value;

  const filtrados = produtos.filter((prod) => {
    const atendeBusca =
      prod.nome.toLowerCase().includes(busca) ||
      prod.sku.toLowerCase().includes(busca);
    const atendeCategoria = categoria === "" || prod.categoria === categoria;
    return atendeBusca && atendeCategoria;
  });

  renderizarTabela(filtrados);
}

// Abrir Modal para Criar Produto
function abrirModalProduto() {
  document.getElementById("modal-titulo").innerText = "Registar Novo Produto";
  document.getElementById("form-produto").reset();
  document.getElementById("prod-id").value = "";
  toggleModal("modal-produto");
}

// Abrir Modal e Preencher para Editar
function editarProduto(id) {
  const prod = produtos.find((p) => p.id === id);
  if (!prod) return;

  document.getElementById("modal-titulo").innerText = "Editar Produto";
  document.getElementById("prod-id").value = prod.id;
  document.getElementById("prod-nome").value = prod.nome;
  document.getElementById("prod-sku").value = prod.sku;
  document.getElementById("prod-categoria").value = prod.categoria;
  document.getElementById("prod-unidade").value = prod.unidade;
  document.getElementById("prod-preco").value = prod.preco;
  document.getElementById("prod-stock").value = prod.stock;
  document.getElementById("prod-stock-min").value = prod.stockMinimo;

  toggleModal("modal-produto");
}

// Salvar / Atualizar Produto
function salvarProduto(event) {
  event.preventDefault();

  const id = document.getElementById("prod-id").value;
  const nome = document.getElementById("prod-nome").value;
  const sku = document.getElementById("prod-sku").value;
  const categoria = document.getElementById("prod-categoria").value;
  const unidade = document.getElementById("prod-unidade").value;
  const preco = parseFloat(document.getElementById("prod-preco").value);
  const stock = parseInt(document.getElementById("prod-stock").value);
  const stockMinimo = parseInt(document.getElementById("prod-stock-min").value);

  if (id) {
    // Atualização de Produto Existente
    const index = produtos.findIndex((p) => p.id == id);
    if (index !== -1) {
      produtos[index] = {
        id: parseInt(id),
        sku,
        nome,
        categoria,
        unidade,
        preco,
        stock,
        stockMinimo,
      };
    }
  } else {
    // Criação de Novo Produto
    const novoProduto = {
      id: Date.now(),
      sku,
      nome,
      categoria,
      unidade,
      preco,
      stock,
      stockMinimo,
    };
    produtos.push(novoProduto);
  }

  renderizarTabela(produtos);
  toggleModal("modal-produto");
}

// Eliminar Produto
function eliminarProduto(id) {
  if (confirm("Tem certeza de que pretende remover este produto do sistema?")) {
    produtos = produtos.filter((p) => p.id !== id);
    renderizarTabela(produtos);
  }
}
