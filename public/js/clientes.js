/**
 * CLIENTES.JS - Gestão de Clientes
 */

// Estado Local dos Clientes (Mock Data)
let clientes = [
    {
        id: 1,
        nome: 'Consumidor Final (Geral)',
        nif: '999999999',
        tipo: 'Particular',
        telefone: '-',
        email: '-',
        endereco: 'Luanda',
        totalCompras: 145000
    },
    {
        id: 2,
        nome: 'Construtora Kianda Lda',
        nif: '5418009871',
        tipo: 'Empresa',
        telefone: '+244 923 111 222',
        email: 'contacto@kianda.ao',
        endereco: 'Talatona, Luanda',
        totalCompras: 1250000
    },
    {
        id: 3,
        nome: 'João Manuel Domingos',
        nif: '006543210LA042',
        tipo: 'Particular',
        telefone: '+244 912 345 678',
        email: 'joao.domingos@gmail.com',
        endereco: 'Viana, Luanda',
        totalCompras: 380000
    }
];

// Inicializar renderização da tabela ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    renderizarTabelaClientes(clientes);
});

// Renderizar Tabela de Clientes
function renderizarTabelaClientes(listaClientes) {
    const tbody = document.getElementById('tabela-clientes-body');
    if (!tbody) return;

    if (listaClientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                    Nenhum cliente encontrado.
                </td>
            </tr>`;
        return;
    }

    let html = '';

    listaClientes.forEach(cli => {
        const badgeTipo = cli.tipo === 'Empresa'
            ? `<span class="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Empresa</span>`
            : `<span class="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">Particular</span>`;

        html += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-900">${cli.nome}</div>
                    <div class="text-xs text-gray-400">NIF: ${cli.nif}</div>
                </td>
                <td class="px-6 py-4">${badgeTipo}</td>
                <td class="px-6 py-4 text-gray-600">${cli.telefone}</td>
                <td class="px-6 py-4 text-gray-500">${cli.endereco || '-'}</td>
                <td class="px-6 py-4 font-semibold text-gray-800">${formatKz(cli.totalCompras)}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="editarCliente(${cli.id})" title="Editar" class="text-gray-400 hover:text-indigo-600 transition">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="eliminarCliente(${cli.id})" title="Eliminar" class="text-gray-400 hover:text-rose-600 transition">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
}

// Filtrar Clientes por Texto e Tipo
function filtrarClientes() {
    const busca = document.getElementById('input-busca-cliente').value.toLowerCase();
    const tipo = document.getElementById('select-tipo-cliente').value;

    const filtrados = clientes.filter(cli => {
        const bateBusca = cli.nome.toLowerCase().includes(busca) ||
                          cli.nif.toLowerCase().includes(busca) ||
                          cli.telefone.toLowerCase().includes(busca);
        const bateTipo = tipo === '' || cli.tipo === tipo;
        return bateBusca && bateTipo;
    });

    renderizarTabelaClientes(filtrados);
}

// Abrir Modal para Criar Cliente
function abrirModalCliente() {
    document.getElementById('modal-cliente-titulo').innerText = 'Registar Novo Cliente';
    document.getElementById('form-cliente').reset();
    document.getElementById('cli-id').value = '';
    toggleModal('modal-cliente');
}

// Abrir Modal e Preencher para Editar
function editarCliente(id) {
    const cli = clientes.find(c => c.id === id);
    if (!cli) return;

    document.getElementById('modal-cliente-titulo').innerText = 'Editar Cliente';
    document.getElementById('cli-id').value = cli.id;
    document.getElementById('cli-nome').value = cli.nome;
    document.getElementById('cli-nif').value = cli.nif;
    document.getElementById('cli-tipo').value = cli.tipo;
    document.getElementById('cli-telefone').value = cli.telefone;
    document.getElementById('cli-email').value = cli.email || '';
    document.getElementById('cli-endereco').value = cli.endereco || '';

    toggleModal('modal-cliente');
}

// Salvar / Atualizar Cliente
function salvarCliente(event) {
    event.preventDefault();

    const id = document.getElementById('cli-id').value;
    const nome = document.getElementById('cli-nome').value;
    const nif = document.getElementById('cli-nif').value;
    const tipo = document.getElementById('cli-tipo').value;
    const telefone = document.getElementById('cli-telefone').value;
    const email = document.getElementById('cli-email').value;
    const endereco = document.getElementById('cli-endereco').value;

    if (id) {
        // Atualização
        const index = clientes.findIndex(c => c.id == id);
        if (index !== -1) {
            clientes[index] = {
                ...clientes[index],
                nome,
                nif,
                tipo,
                telefone,
                email,
                endereco
            };
        }
    } else {
        // Novo Registo
        const novoCliente = {
            id: Date.now(),
            nome,
            nif,
            tipo,
            telefone,
            email,
            endereco,
            totalCompras: 0
        };
        clientes.push(novoCliente);
    }

    renderizarTabelaClientes(clientes);
    toggleModal('modal-cliente');
}

// Eliminar Cliente
function eliminarCliente(id) {
    if (id === 1) {
        alert('O cliente "Consumidor Final" é padrão e não pode ser removido.');
        return;
    }

    if (confirm('Tem certeza de que pretende remover este cliente?')) {
        clientes = clientes.filter(c => c.id !== id);
        renderizarTabelaClientes(clientes);
    }
}