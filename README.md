# 🗓️ AgendAI – Sistema de Agendamento SaaS

Sistema completo multi-tenant para profissionais autônomos gerenciarem seus agendamentos, clientes e serviços, com integração WhatsApp.



## 🚀 Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Node.js + Express |
| Frontend | React 18 + React Router |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT |
| WhatsApp | WhatsApp Cloud API (Meta) |
| Relatórios | Recharts |
| Agendamentos | React Big Calendar |

---

## 📁 Estrutura do Projeto

```
agendai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Conexão PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, registro, perfil
│   │   │   ├── clientsController.js # CRUD clientes
│   │   │   ├── servicesController.js# CRUD serviços
│   │   │   └── appointmentsController.js # Agendamentos + relatórios
│   │   ├── middleware/
│   │   │   └── auth.js              # Middleware JWT
│   │   ├── routes/
│   │   │   └── index.js             # Todas as rotas
│   │   ├── utils/
│   │   │   ├── whatsapp.js          # sendWhatsAppMessage()
│   │   │   └── reminderJob.js       # Cron de lembretes
│   │   └── server.js                # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Auth global
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AgendaPage.jsx
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── ClientsPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── utils/
│   │   │   └── api.js               # Axios configurado
│   │   └── App.jsx
│   └── package.json
│
└── database/
    └── schema.sql                   # Script de criação das tabelas
```

---

## ⚙️ Como Executar

### 1. Banco de Dados (PostgreSQL)

```bash
# Crie o banco
createdb agendai

# Execute o schema
psql -d agendai -f database/schema.sql
```

### 2. Backend

```bash
cd backend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie em desenvolvimento
npm run dev

# Ou em produção
npm start
```

O backend estará rodando em: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend

# Instale dependências
npm install

# Inicie
npm start
```

O frontend estará disponível em: `http://localhost:3000`

---

## 🔧 Variáveis de Ambiente (backend/.env)

```env
PORT=3001
NODE_ENV=development

# PostgreSQL (obrigatório)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/agendai

# JWT (obrigatório — use uma chave longa e aleatória)
JWT_SECRET=chave_muito_secreta_aqui
JWT_EXPIRES_IN=7d

# WhatsApp Cloud API (opcional — deixe em branco para desativar)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_TOKEN=EAAxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## 📡 Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Perfil |
| PUT | /api/auth/profile | Atualizar perfil + config WhatsApp |

### Clientes
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/clients | Listar |
| POST | /api/clients | Criar |
| PUT | /api/clients/:id | Editar |
| DELETE | /api/clients/:id | Remover |
| GET | /api/clients/:id/history | Histórico |

### Serviços
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/services | Listar |
| POST | /api/services | Criar |
| PUT | /api/services/:id | Editar |
| DELETE | /api/services/:id | Remover |

### Agendamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/appointments | Listar (filtros: start, end, status) |
| POST | /api/appointments | Criar (envia WhatsApp automaticamente) |
| PATCH | /api/appointments/:id/status | Atualizar status |
| DELETE | /api/appointments/:id | Remover |
| GET | /api/appointments/dashboard | Dados do dashboard |
| GET | /api/appointments/report?year=&month= | Relatório mensal |

---

## 📱 Integração WhatsApp

### Como configurar

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um app do tipo "Business"
3. Adicione o produto "WhatsApp"
4. Copie o **Token de Acesso** e o **Phone Number ID**
5. Cole nas configurações do perfil no sistema (ou no `.env`)

### Função principal

```javascript
const { sendWhatsAppMessage } = require('./utils/whatsapp');

await sendWhatsAppMessage(
  '5511999999999',           // Número do cliente
  'Olá! Seu agendamento...'  // Mensagem
);
```

### Mensagens automáticas

- **Ao criar agendamento**: confirmação com data, hora e valor
- **24h antes**: lembrete automático via cron job (roda a cada hora)

---

## 🔐 Segurança

- Senhas com bcrypt (salt 12)
- JWT com expiração configurável
- Middleware em todas as rotas privadas
- Multi-tenant: cada query filtra por `user_id`
- Validação de conflito de horário na criação

---

## 🎨 Adaptação para Nichos

O sistema foi estruturado para ser facilmente adaptável:

| Nicho | profession field | Serviços sugeridos |
|-------|------------------|--------------------|
| Barbearia | "Barbearia" | Corte, Barba, Hidratação |
| Clínica Estética | "Clínica de Estética" | Limpeza de pele, Botox... |
| Personal Trainer | "Personal Trainer" | Treino funcional, Assessment... |
| Psicólogo | "Psicólogo" | Sessão individual, Casal... |
| Manicure | "Manicure / Pedicure" | Esmaltação, Gel... |

---

## 📦 Deploy Sugerido

| Serviço | Uso |
|---------|-----|
| [Railway](https://railway.app) | Backend + PostgreSQL (grátis) |
| [Vercel](https://vercel.com) | Frontend React (grátis) |
| [Render](https://render.com) | Alternativa para backend |
| [Neon](https://neon.tech) | PostgreSQL serverless (grátis) |

---

## 📝 Licença

MIT — Livre para uso comercial e modificações.
