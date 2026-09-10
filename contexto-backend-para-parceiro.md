# Contexto completo do Backend — Projeto Legacy

Este documento é para a IA que vai ajudar o parceiro de frontend deste projeto. Lê tudo antes de começares a ajudar — explica o estado completo do backend, como ele funciona, e o que falta fazer.

---

## 1. O que é este projeto

Uma plataforma web de gestão e vendas para uma empresa familiar em Luanda, Angola. Substitui processos manuais por um sistema digital.

**Divisão de trabalho:**
- **dj** (o autor original deste documento) — está a construir o **backend** (`legacy-api`), sozinho, com ajuda de duas IAs diferentes: uma para arquitetura/decisões (ChatGPT) e a Claude para execução/código.
- **O teu utilizador (parceiro do dj)** — vai construir o **frontend** (`legacy-web`), que consome a API do backend.

O frontend **depende do backend** para funcionar — todos os dados (produtos, vendas, clientes, etc.) vêm da API que já está a ser construída. O teu papel é ajudar o utilizador a construir as telas que consomem essa API.

---

## 2. Regras gerais do projeto (aplicam-se a ambos os lados)

Estas regras vieram de um documento de especificação (`LEGACY.docx`) que orienta todo o projeto:

- Prioriza simplicidade — não adicionar funcionalidades não pedidas
- Trabalhar por etapas: definir requisito → lógica → dados → estrutura técnica → implementação → teste → validação, antes de avançar para a próxima coisa
- Não avançar para uma funcionalidade nova enquanto a atual não estiver validada
- Se encontrares uma decisão técnica problemática, avisa antes de implementar — não decidas sozinho e sigas em frente
- Interface em português, valores em Kz (moeda angolana), pensada para pessoas não técnicas usarem no dia a dia
- Prioridade: construir algo realmente utilizável pela empresa, não um projeto de demonstração

---

## 3. Stack tecnológica do projeto (todo o projeto, não só backend)

**Backend** (já construído, ver detalhes abaixo):
- Node.js, TypeScript, NestJS
- PostgreSQL + Prisma ORM (versão 7.10.0 — não a 8, que ainda é instável)
- Docker (para correr o PostgreSQL localmente)
- Autenticação JWT

**Frontend** (a construir pelo parceiro):
- Next.js, React, TypeScript, Tailwind CSS

**Ambiente:**
- O dj trabalha em Linux (já usou WSL2 no Windows, mas mudou para Ubuntu nativo)
- Perguntar ao utilizador logo no início: **em que sistema operativo está a trabalhar, e prefere usar terminal ou uma interface gráfica/editor visual?** Isto muda como o vais guiar — o dj trabalha tudo por linha de comandos (terminal), mas o parceiro pode preferir outra abordagem. Adapta-te ao que ele preferir, sem assumir que ele sabe usar terminal.

---

## 4. Estado atual do Backend — o que já está pronto

O backend (`legacy-api`) já tem estas funcionalidades completas, testadas e commitadas no GitHub (`https://github.com/Emmaserver/Legacy.git`):

### 4.1 Produtos (`/products`)
- CRUD completo: criar, listar, ver um, atualizar, desativar (nunca apaga fisicamente)
- Campos: nome, sku (opcional), unidade de medida (UNIDADE/KG/METRO/LITRO/CAIXA/SACO), precoCusto, precoVenda, estado (ATIVO/INATIVO), quantidadeAtual, categoria
- Endpoints: `POST /products`, `GET /products`, `GET /products/:id`, `PATCH /products/:id`, `PATCH /products/:id/deactivate`

### 4.2 Categorias (`/categories`)
- CRUD completo, com regra: não pode desativar categoria que tenha produtos associados (erro 409)
- Campos: nome, estado
- Endpoints: `POST /categories`, `GET /categories`, `GET /categories/:id`, `PATCH /categories/:id`, `PATCH /categories/:id/deactivate`

### 4.3 Clientes (`/clients`)
- CRUD completo
- Campos: nome, telefone (obrigatório), documento (opcional, único — BI ou NIF), tipo (PESSOA_FISICA/EMPRESA), permiteFiado (boolean, controla se pode ter vendas pendentes/parciais), estado
- Endpoints: `POST /clients`, `GET /clients`, `GET /clients/:id`, `PATCH /clients/:id`, `PATCH /clients/:id/deactivate`

### 4.4 Stock (`/stock`)
- Sistema de movimentações com histórico completo (nunca só um número solto)
- Tipos de movimentação: ENTRADA, SAIDA, AJUSTE
- Nunca permite stock ficar negativo
- Endpoints:
  - `GET /stock/:productId` — stock atual de um produto
  - `GET /stock/:productId/history` — histórico de movimentações
  - `POST /stock/entry` — dar entrada (body: productId, quantidade, motivo opcional)
  - `POST /stock/exit` — dar saída (body: productId, quantidade, motivo opcional)
  - `POST /stock/adjustment` — ajuste manual, positivo ou negativo (body: productId, quantidade, motivo **obrigatório**)

### 4.5 Vendas (`/sales`)
A funcionalidade mais complexa. Regras importantes:
- Uma venda tem vários itens (produtos diferentes, cada um com quantidade)
- Cliente é **opcional** (venda avulsa/balcão)
- Venda **sem** cliente tem de ser paga por completo no ato
- Venda **com** cliente pode ficar PENDENTE ou PARCIAL, mas só se o cliente tiver `permiteFiado: true`
- Stock reduz **imediatamente** ao criar a venda (a mercadoria sai fisicamente logo, independente do pagamento)
- Preço de cada item é **histórico** — fica gravado no momento da venda, nunca é recalculado depois mesmo que o preço do produto mude
- Cancelar uma venda devolve o stock automaticamente e regista isso no histórico
- Nunca se apaga uma venda — só se cancela (estado ATIVA/CANCELADA)

Endpoints:
- `POST /sales` — criar venda (body: clientId opcional, itens: [{productId, quantidade}], valorPago opcional)
- `GET /sales` — listar todas
- `GET /sales/:id` — ver uma venda com detalhes
- `POST /sales/:id/payments` — registar pagamento adicional (body: valor)
- `PATCH /sales/:id/cancel` — cancelar (devolve stock)

### 4.6 Autenticação e Autorização (`/auth`, `/users`)
- Login via email + password, devolve um token JWT (válido 8h)
- **Toda a API exige login** (token no header `Authorization: Bearer <token>`), exceto `/auth/login`
- Dois papéis: ADMINISTRADOR e GERENTE
- Operações do dia a dia (vendas, produtos, clientes, stock, cancelar venda) — qualquer papel pode fazer
- Só ADMINISTRADOR pode criar novos utilizadores
- Endpoints:
  - `POST /auth/login` (body: email, password) — pública, não precisa de token
  - `POST /users` (só ADMINISTRADOR) — criar utilizador
  - `GET /users` (só ADMINISTRADOR) — listar utilizadores
  - `PATCH /users/:id/deactivate` (só ADMINISTRADOR)

**Utilizador administrador inicial (criado via seed):**
- Email: `admin@legacy.com`
- Password: `Admin@123` (deve ser trocada assim que possível)

### 4.7 Dashboard (`/dashboard`)
- Um único endpoint `GET /dashboard` que devolve dados agregados para o frontend construir o painel visual:
```json
{
  "vendasHoje": { "total": 2000, "quantidade": 1 },
  "vendasMes": { "total": 2000, "quantidade": 1 },
  "valorPendente": 1500,
  "produtosStockBaixo": [{ "id": "...", "nome": "...", "quantidadeAtual": 5 }]
}
```
- Este endpoint é exatamente o tipo de coisa que o frontend deve chamar para desenhar o dashboard visual (gráficos, cartões, cores). O backend só fornece os números.

### 4.8 Relatórios (`/reports`) — EM CONSTRUÇÃO no momento em que este documento foi escrito
Três relatórios estão a ser implementados:
1. Vendas por período (data início/fim)
2. Produtos mais vendidos
3. Histórico de pagamentos por cliente

Se este módulo ainda não estiver pronto quando leres isto, pergunta ao dj o estado atual antes de o frontend tentar consumi-lo.

---

## 5. O que falta fazer no backend (depois dos relatórios)

- **Paginação** — as listas (`GET /sales`, `GET /products`, etc.) ainda devolvem tudo de uma vez, sem paginar. Isto vai ser adicionado, e vai mudar ligeiramente o formato da resposta dessas rotas (provavelmente para `{ data: [...], total: N, page: N }` em vez de um array simples) — importante teres isto em mente ao construíres listagens no frontend, para não depender demasiado do formato atual.
- **Auditoria** — registo de quem fez o quê em operações críticas. Não afeta diretamente o frontend.
- **Testes automatizados** — não afeta o frontend.

Fora do MVP (não vai existir tão cedo): gestão de entregas, fornecedores, compras/reposição de stock, faturas/documentos, relatórios avançados.

---

## 6. Base de Dados — como funciona e como aceder

### 6.1 Tecnologia
PostgreSQL, a correr num container Docker chamado `legacy-postgres`, gerido pelo Prisma ORM.

### 6.2 Tabelas existentes
`categories`, `products`, `clients`, `stock_movements`, `sales`, `sale_items`, `payments`, `users` — 8 tabelas, uma por cada funcionalidade descrita acima.

### 6.3 Como iniciar a base de dados (primeira vez, ambiente novo)

Assumindo que o Node.js, Docker e Git já estão instalados (o dj tem um guia próprio de preparação de ambiente, pede-lho se precisares), dentro da pasta do projeto (`legacy-api`):

```bash
# 1. Subir o PostgreSQL via Docker
docker compose up -d

# 2. Confirmar que está a correr
docker ps

# 3. Criar o ficheiro .env (copiando o modelo)
cp .env.example .env
# depois editar o .env e gerar um JWT_SECRET novo com:
openssl rand -base64 32
# colar o valor gerado na linha JWT_SECRET="..." do .env

# 4. Instalar dependências
npm install

# 5. Gerar o Prisma Client
npx prisma generate

# 6. Aplicar as migrations (cria todas as tabelas)
npx prisma migrate deploy

# 7. Criar o utilizador Administrador inicial
npx prisma db seed

# 8. Arrancar o servidor
npm run start
```

O servidor fica disponível em `http://localhost:3000`.

### 6.4 Como ver as tabelas e os dados visualmente

**Opção mais fácil — Prisma Studio** (abre no browser):
```bash
npx prisma studio
```
Abre em `http://localhost:5555`. Mostra todas as tabelas na barra lateral, com interface para ver/editar dados sem escrever SQL.

**Alternativa — Docker Desktop** (se instalado, tem versão gráfica): mostra o container `legacy-postgres` a correr, mas não navega dentro das tabelas — só gere o container em si.

### 6.5 Cada máquina tem a sua própria base de dados

Importante: o PostgreSQL corre localmente em cada computador, dentro do Docker. Os **dados** (produtos, vendas, clientes que alguém criar) **não são partilhados** entre máquinas diferentes — só a **estrutura** das tabelas (schema) é partilhada, através do código no Git. Isto significa que o frontend, ao testar localmente, vai ver os dados que existirem na base de dados local de quem estiver a testar, não os dados de outra pessoa.

---

## 7. Como o frontend deve comunicar com o backend

- Toda a comunicação é via **HTTP/REST**, nunca acesso direto à base de dados
- Depois do login (`POST /auth/login`), guardar o `accessToken` devolvido e enviá-lo em todas as chamadas seguintes no header:
  ```
  Authorization: Bearer <token>
  ```
- O token expira em 8 horas — o frontend deve tratar erros `401 Unauthorized` como sessão expirada e redirecionar para o login
- Erros de validação vêm como `400 Bad Request` com uma mensagem clara
- Erros de permissão vêm como `403 Forbidden`
- Erros de "não encontrado" vêm como `404 Not Found`
- Conflitos de regras de negócio (ex: stock insuficiente, documento duplicado) vêm como `409 Conflict`, com mensagem explicativa

---

## 8. Como agir a partir daqui

1. **Pergunta ao utilizador em que sistema operativo está a trabalhar e se prefere usar terminal ou uma interface gráfica** — não assumas nada.
2. Ajuda-o a preparar o ambiente de frontend (Node.js, o repositório `legacy-web` — se ainda não existir, pergunta ao dj), sempre confirmando cada passo antes de avançar, tal como está a ser feito no backend.
3. Sempre que o frontend precisar de um endpoint que ainda não existe ou que se comporte de forma diferente do descrito aqui, a instrução é: **perguntar ao dj antes de assumir** — o backend está a evoluir e este documento pode ficar desatualizado.
4. Segue a mesma filosofia de trabalho do backend: por etapas, validando cada coisa antes de avançar, sem inventar funcionalidades não pedidas.
