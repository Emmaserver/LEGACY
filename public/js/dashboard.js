const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  carregarMetricasDashboard();
});

function formatKz(valor) {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' })
    .format(valor)
    .replace('AOA', 'Kz');
}

async function carregarMetricasDashboard() {
  try {
    // Exemplo de chamadas paralelas às rotas da API NestJS
    const [resProdutos, resClientes, resVendas] = await Promise.all([
      fetch(`${API_BASE}/products`),
      fetch(`${API_BASE}/clients`),
      fetch(`${API_BASE}/vendas`).catch(() => null), // Caso o endpoint de vendas ainda esteja a ser finalizado
    ]);

    const produtos = resProdutos.ok ? await resProdutos.json() : [];
    const clientes = resClientes.ok ? await resClientes.json() : [];
    const vendas = resVendas && resVendas.ok ? await resVendas.json() : [];

    renderizarCards(produtos, clientes, vendas);
    renderizarUltimasVendas(vendas);
    renderizarProdutosCriticos(produtos);
  } catch (erro) {
    console.error('Erro ao carregar dados do Dashboard:', erro);
  }
}

function renderizarCards(produtos, clientes, vendas) {
  // Total Clientes e Produtos
  document.getElementById('metric-total-clientes').innerText = clientes.length;
  document.getElementById('metric-total-produtos').innerText = produtos.length;

  // Alertas de Stock (Produtos onde stockQuantity <= stockMinimo)
  const produtosCriticos = produtos.filter(
    (p) => (p.stockQuantity ?? p.stock) <= (p.stockMinimo ?? 5),
  );
  document.getElementById('metric-baixo-stock').innerText =
    produtosCriticos.length;

  // Métricas de Vendas
  const totalHoje = vendas.reduce((acc, v) => acc + (v.total || 0), 0);
  document.getElementById('metric-vendas-hoje').innerText = formatKz(totalHoje);
  document.getElementById('metric-vendas-qtd').innerText =
    `${vendas.length} transações`;
}

function renderizarUltimasVendas(vendas) {
  const tbody = document.getElementById('tabela-ultimas-vendas');
  if (!vendas || vendas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-6 text-center text-gray-400">Nenhuma venda registada até ao momento.</td></tr>`;
    return;
  }

  // Mostrar apenas as últimas 5 vendas
  const ultimas = vendas.slice(0, 5);
  tbody.innerHTML = ultimas
    .map(
      (v) => `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-6 py-3 font-bold text-gray-900">${v.codigo || `#${v.id}`}</td>
            <td class="px-6 py-3 text-gray-800">${v.client?.name || v.cliente || 'Consumidor Final'}</td>
            <td class="px-6 py-3 text-gray-500 text-xs">${v.paymentMethod || v.metodoPagamento || 'Numerário'}</td>
            <td class="px-6 py-3 text-right font-bold text-indigo-600">${formatKz(v.total)}</td>
        </tr>
    `,
    )
    .join('');
}

function renderizarProdutosCriticos(produtos) {
  const ul = document.getElementById('lista-baixo-stock');
  const criticos = produtos.filter(
    (p) => (p.stockQuantity ?? p.stock) <= (p.stockMinimo ?? 5),
  );

  if (criticos.length === 0) {
    ul.innerHTML = `<li class="py-4 text-center text-xs text-gray-400">Todos os produtos estão com níveis de stock adequados.</li>`;
    return;
  }

  ul.innerHTML = criticos
    .map(
      (p) => `
        <li class="py-3 flex items-center justify-between">
            <div>
                <p class="text-sm font-semibold text-gray-800">${p.name || p.nome}</p>
                <span class="text-xs text-gray-400">Código: ${p.code || p.codigo || 'N/A'}</span>
            </div>
            <div class="text-right">
                <span class="px-2 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">
                    ${p.stockQuantity ?? p.stock} un
                </span>
            </div>
        </li>
    `,
    )
    .join('');
}
