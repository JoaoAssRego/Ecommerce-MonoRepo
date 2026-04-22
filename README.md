# 🛒 Ecommerce MonoRepo

> Plataforma de e-commerce full stack escalável, construída com as melhores práticas de arquitetura para produção em 2026.

---

## 🧱 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 19 + Vite + TypeScript |
| **Estilização** | Tailwind CSS v4 |
| **Estado do Servidor** | TanStack Query v5 |
| **Estado do Cliente** | Zustand |
| **Backend** | Node.js + Express |
| **Banco de Dados** | MongoDB + Mongoose |
| **Autenticação** | JWT + Refresh Token Rotation (HttpOnly Cookies) |
| **Pagamentos** | Stripe (orientado a Webhooks) |
| **Upload de Imagens** | Cloudinary (Signed Direct Uploads) |
| **Deploy** | Vercel (Serverless) |
| **Testes** | Vitest + React Testing Library + Playwright (E2E) |

---

## 📁 Estrutura do Projeto (Monorepo)

```
ecommerce-monorepo/
├── client/                         # Frontend React + Vite
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                 # Componentes base (Button, Input, Skeleton...)
│   │   │   └── shared/             # Componentes compartilhados entre páginas
│   │   ├── features/               # Módulos de domínio
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── catalog/
│   │   │   ├── checkout/
│   │   │   └── orders/
│   │   ├── hooks/                  # Custom hooks globais
│   │   ├── lib/                    # Configurações (axios, queryClient...)
│   │   ├── pages/
│   │   ├── store/                  # Zustand stores (carrinho, UI...)
│   │   ├── types/
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                         # Backend Node.js + Express
│   ├── src/
│   │   ├── config/                 # Variáveis de ambiente, DB, Stripe...
│   │   ├── controllers/            # Recebem req/res, delegam para Services
│   │   ├── services/               # Lógica de negócio isolada (Service Layer)
│   │   ├── models/                 # Schemas Mongoose
│   │   ├── routes/                 # Definição de rotas Express
│   │   ├── middlewares/            # Auth, rate limit, erros globais...
│   │   ├── errors/                 # Classes de erro customizadas
│   │   ├── utils/
│   │   └── app.ts                  # Configuração do Express
│   ├── server.ts                   # Entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json                    # Scripts raiz do monorepo
└── README.md
```

---

## 🏛️ Decisões Arquiteturais

### Backend — Service Layer Pattern
Os controllers HTTP são responsáveis apenas por receber a requisição e devolver a resposta. Toda a lógica de negócio (validações complexas, regras de domínio) vive nos Services, tornando o código testável e desacoplado do protocolo HTTP.

### Autenticação — JWT + Refresh Token Rotation
- O `accessToken` tem vida curta (15 min) e é enviado no header `Authorization`.
- O `refreshToken` é armazenado exclusivamente em cookie `HttpOnly; Secure; SameSite=Strict`, inacessível via JavaScript.
- A cada renovação, um novo par de tokens é gerado (rotação), invalidando o anterior.

### Modelagem — Snapshot Pattern em Pedidos
Os dados do produto (preço, título, SKU) e o endereço de entrega são **copiados** no documento de pedido no momento do checkout. Isso garante consistência histórica: alterações futuras no produto não corrompem pedidos já realizados. Todos os valores monetários são armazenados em **centavos** (inteiros) para evitar erros de ponto flutuante.

### Estoque — Transações ACID
A dedução de estoque durante o checkout utiliza **sessões do Mongoose** com transações ACID, prevenindo overselling em cenários de alta concorrência.

### Upload de Imagens — Signed Direct Upload
O servidor Node.js gera apenas uma assinatura criptográfica. O cliente React envia o arquivo diretamente ao Cloudinary, sem passar pelo servidor, economizando banda e contornando o limite de payload de **4.5MB** da Vercel.

### Pagamentos — Webhook-First
O fluxo de confirmação de pagamento é orientado exclusivamente por **webhooks do Stripe**. A dedução final de estoque e a criação do pedido só ocorrem após a validação da assinatura criptográfica do evento `payment_intent.succeeded`. O endpoint retorna `HTTP 200` imediatamente para evitar timeouts.

### Frontend — Separação de Estado
| Tipo de Estado | Solução |
|---|---|
| Cache do servidor (produtos, pedidos) | TanStack Query (stale-while-revalidate) |
| Estado local do cliente (carrinho, UI) | Zustand |
| Filtros de catálogo | URL via `useSearchParams` (links compartilháveis) |

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos
- Node.js >= 20
- MongoDB (local ou Atlas)
- Conta Stripe e Cloudinary

### 1. Clone e instale as dependências

```bash
git clone https://github.com/JoaoAssRego/Ecommerce-MonoRepo.git
cd ecommerce-monorepo

# Instala dependências do client e server
npm install --prefix client
npm install --prefix server
```

### 2. Configure as variáveis de ambiente

```bash
cp server/.env.example server/.env
# Edite server/.env com suas credenciais
```

### 3. Inicie o projeto

```bash
# Inicia client (porta 5173) e server (porta 5000) simultaneamente
npm run dev
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `server/.env` baseado no `server/.env.example`:

```env
# Servidor
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_ACCESS_SECRET=seu_secret_aqui
JWT_REFRESH_SECRET=seu_refresh_secret_aqui

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Client
CLIENT_URL=http://localhost:5173
```

> ⚠️ **Nunca commite o arquivo `.env`**. Ele está no `.gitignore`.

---

## 🧪 Testes

```bash
# Testes unitários e de integração (Vitest)
npm run test --prefix client
npm run test --prefix server

# Testes End-to-End (Playwright)
npm run test:e2e
```

---

## 🚀 Deploy (Vercel)

O projeto é otimizado para deploy na **Vercel** com funções Serverless:

- Timeout configurado entre 10s–60s por rota
- Payload máximo respeitado (< 4.5MB)
- Webhooks retornam `HTTP 200` imediatamente antes de processar

Configure as variáveis de ambiente no dashboard da Vercel espelhando o arquivo `.env`.

---

## 📋 Roadmap de Desenvolvimento

- [x] **Fase 1** — Configuração inicial e arquitetura de pastas
- [ ] **Fase 2** — Modelagem de dados (MongoDB/Mongoose)
- [ ] **Fase 3** — Autenticação (JWT + Refresh Token Rotation)
- [ ] **Fase 4** — Catálogo de produtos e filtros
- [ ] **Fase 5** — Carrinho e checkout
- [ ] **Fase 6** — Integração Stripe (Webhooks)
- [ ] **Fase 7** — Upload de imagens (Cloudinary)
- [ ] **Fase 8** — Painel administrativo
- [ ] **Fase 9** — Testes (Vitest + Playwright)
- [ ] **Fase 10** — Deploy e otimizações de produção

---

## 📄 Licença

MIT © [João Rego](https://github.com/JoaoAssRego)