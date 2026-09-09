/**
 * HISTORICO.JS - Gestão do Histórico de Vendas
 */

// Estado Local do Histórico (Mock Data)
let vendas = [
    {
        id: 101,
        codigo: 'VD-2026-001',
        data: '2026-09-03T14:30:00',
        cliente: 'Construtora Kianda Lda',
        metodoPagamento: 'Transferência',
        estado: 'Concluída',
        itens: [
            { produto: 'Cimento Secil 50kg', qtd: 20, precoUn: 5500 },
            { produto: 'Varão de Aço 12mm', qtd: 10, precoUn: 4200 }
        ],
        total: 152000
    },
    {
        id: 102,
        codigo: 'VD-2026-002',
        data: '2026-09-04T09:15:00',
        cliente: 'Consumidor Final (Geral)',
        metodoPagamento: 'Numerário',
        estado: 'Concluída',
        itens: [
            { produto: 'Tinta Acrílica Branca 18L', qtd: 1, precoUn: 28500 }
        ],
        total: 28500
    },
    {
        id: 103,
        codigo: 'VD-2026-003',
        data: '2026-09-04T11:45:00',
        cliente: 'João Manuel Domingos',
        metodoPagamento: 'TPA',
        estado: 'Concluída',
        itens: [
            { produto: 'Areia Fina (m³)', qtd: 2, precoUn: 15000 },
            { produto: 'Tubo PVC 110mm', qtd: 5, precoUn: 3800 }
        ],
        total: 49000
    }
];

let vendaSelecionada = null;

// Inicializar renderização da tabela ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    renderizarTabelaVendas(vendas);
});

// Renderizar Tabela de Vendas
function renderizarTabelaVendas(listaVendas) {
    const tbody = document.getElementById('tabela-vendas-body');
    if (!tbody) return;

    if (listaVendas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-400">
                    Nenhuma venda encontrada no histórico.
                </td>
            </tr>`;
        atualizarResumoFinanceiro(0);
        return;
    }

    let html = '';
    let somaTotal = 0;

    listaVendas.forEach(venda => {
        somaTotal += venda.total;

        const badgeEstado = `<span class="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">Concluída</span>`;

        html += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-bold text-gray-900">${venda.codigo}</td>
                <td class="px-6 py-4 text-gray-500">${formatData(venda.data)}</td>
                <td class="px-6 py-4 font-medium text-gray-800">${venda.cliente}</td>
                <td class="px-6 py-4 text-gray-600">${venda.metodoPagamento}</td>
                <td class="px-6 py-4 font-bold text-indigo-600">${formatKz(venda.total)}</td>
                <td class="px-6 py-4 text-center">${badgeEstado}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="verDetalhesVenda(${venda.id})" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg font-medium text-xs transition">
                        Ver Detalhes
                    </button>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
    atualizarResumoFinanceiro(somaTotal);
}

// Atualizar o indicador visual do valor total na barra de topo
function atualizarResumoFinanceiro(total) {
    const elResumo = document.getElementById('resumo-total-filtrado');
    if (elResumo) {
        elResumo.innerText = formatKz(total);
    }
}

// Filtrar Vendas por Texto e Método de Pagamento
function filtrarVendas() {
    const busca = document.getElementById('input-busca-venda').value.toLowerCase();
    const metodo = document.getElementById('select-metodo-pagamento').value;

    const filtradas = vendas.filter(venda => {
        const bateBusca = venda.codigo.toLowerCase().includes(busca) ||
                          venda.cliente.toLowerCase().includes(busca);
        const bateMetodo = metodo === '' || venda.metodoPagamento === metodo;
        return bateBusca && bateMetodo;
    });

    renderizarTabelaVendas(filtradas);
}

// Abrir Modal e Preencher Detalhes da Venda
function verDetalhesVenda(vendaId) {
    vendaSelecionada = vendas.find(v => v.id === vendaId);
    if (!vendaSelecionada) return;

    document.getElementById('detalhe-codigo-venda').innerText = `Venda #${vendaSelecionada.codigo}`;
    document.getElementById('detalhe-data-venda').innerText = `Realizada em: ${formatData(vendaSelecionada.data)}`;
    document.getElementById('detalhe-cliente').innerText = vendaSelecionada.cliente;
    document.getElementById('detalhe-pagamento').innerText = vendaSelecionada.metodoPagamento;

    // Preencher Tabela de Itens
    const tbodyItens = document.getElementById('detalhe-itens-body');
    let htmlItens = '';

    vendaSelecionada.itens.forEach(item => {
        const subtotal = item.qtd * item.precoUn;
        htmlItens += `
            <tr class="hover:bg-gray-50">
                <td class="p-2.5 font-medium text-gray-800">${item.produto}</td>
                <td class="p-2.5 text-center text-gray-600">${item.qtd}</td>
                <td class="p-2.5 text-right text-gray-600">${formatKz(item.precoUn)}</td>
                <td class="p-2.5 text-right font-semibold text-gray-800">${formatKz(subtotal)}</td>
            </tr>`;
    });

    tbodyItens.innerHTML = htmlItens;

    // Totais
    document.getElementById('detalhe-subtotal').innerText = formatKz(vendaSelecionada.total);
    document.getElementById('detalhe-total').innerText = formatKz(vendaSelecionada.total);

    toggleModal('modal-detalhe-venda');
}

// Simulação de Impressão de Recibo
function imprimirRecibo() {
    if (!vendaSelecionada) return;

    let reciboTexto = `=== RECIBO DE VENDA ===\n`;
    reciboTexto += `Código: ${vendaSelecionada.codigo}\n`;
    reciboTexto += `Data: ${formatData(vendaSelecionada.data)}\n`;
    reciboTexto += `Cliente: ${vendaSelecionada.cliente}\n`;
    reciboTexto += `Forma de Pagamento: ${vendaSelecionada.metodoPagamento}\n`;
    reciboTexto += `-----------------------------\n`;
    
    vendaSelecionada.itens.forEach(i => {
        reciboTexto += `${i.qtd}x ${i.produto} - ${formatKz(i.qtd * i.precoUn)}\n`;
    });

    reciboTexto += `-----------------------------\n`;
    reciboTexto += `TOTAL: ${formatKz(vendaSelecionada.total)}\n`;
    reciboTexto += `=============================`;

    alert(reciboTexto);
}