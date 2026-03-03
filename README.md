# 🗓️ AgendAI – Sistema de Agendamento SaaS

Sistema multi-tenant completo para profissionais autônomos gerenciarem agendamentos, clientes e serviços. Clientes agendam de forma autônoma via **link público personalizado**, sem precisar instalar nenhum app.

🔗 **Demo:** [agendai-phi.vercel.app](https://agendai-phi.vercel.app)

---

## ✨ Funcionalidades

### Para o profissional
- 📋 Dashboard com agendamentos do dia e métricas do mês
- 📅 Agenda semanal visual
- 👥 Gestão de clientes com histórico
- ✂️ Cadastro de serviços (nome, duração, preço, cor)
- 🕐 Configuração de horários de funcionamento por dia da semana
- 📊 Relatórios mensais com receita por serviço
- 🔔 Notificação em tempo real de novos agendamentos (badge + toast)
- 🔗 Link público de agendamento compartilhável

### Para o cliente
- Acessa o link do profissional no navegador
- Escolhe o serviço, data e horário disponível
- Informa nome e telefone
- Recebe confirmação na tela

### Onboarding
- Cadastro em 3 passos: dados → horários → serviços
- Link de agendamento gerado automaticamente via `booking_slug`

---

## 🚀 Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Node.js + Express |
| Frontend | React 18 + React Router v6 |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT |
| Relatórios | Recharts |
| Deploy Backend | Railway |
| Deploy Frontend | Vercel |

---

## 📁 Estrutura do Projeto

```
agendai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js               # Conexão PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.js         # Login, registro, perfil
│   │   │   ├── clientsController.js      # CRUD clientes
│   │   │   ├── servicesController.js     # CRUD serviços
│   │   │   └── appointmentsController.js # Agendamentos + relatórios + dashboard
│   │   ├── middleware/
│   │   │   └── auth.js                   # Middleware JWT
│   │   ├── routes/
│   │   │   ├── index.js                  # Rotas privadas
│   │   │   ├── booking.js                # Rotas públicas de agendamento
│   │   │   └── workingHours.js           # Horários de funcionamento
│   │   ├── utils/
│   │   │   ├── whatsapp.js               # WhatsApp Cloud API (desativado)
│   │   │   └── reminderJob.js            # Cron de lembretes (desativado)
│   │   └── server.js                     # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx           # Auth global com localStorage
│   │   ├── components/
│   │   │   ├── Layout.jsx                # Sidebar + polling de notificações
│   │   │   └── NichePage.jsx             # Template de página de nicho
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx           # Página inicial pública
│   │   │   ├── NichePages.jsx            # Páginas por nicho (barbearia, clínica...)
│   │   │   ├── LoginPage.jsx             # Login + cadastro
│   │   │   ├── OnboardingPage.jsx        # Setup inicial em 3 passos
│   │   │   ├── BookingPage.jsx           # Página pública de agendamento do cliente
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AgendaPage.jsx
│   │   │   ├── AppointmentsPage.jsx      # Com polling automático a cada 30s
│   │   │   ├── ClientsPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── utils/
│   │   │   └── api.js                    # Axios configurado
│   │   └── App.jsx                       # Rotas públicas + privadas
│   └── package.json
│
└── database/
    ├── schema.sql                         # Schema principal
    └── migration_working_hours.sql        # Migration: working_hours + onboarding
```

---

## ⚙️ Como Executar Localmente

### 1. Banco de Dados

```bash
createdb agendai
psql -d agendai -f database/schema.sql
psql -d agendai -f database/migration_working_hours.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais
npm run dev
```

Rodando em: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Disponível em: `http://localhost:3000`

---

## 🔧 Variáveis de Ambiente

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development

# PostgreSQL (obrigatório)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/agendai

# JWT (obrigatório)
JWT_SECRET=chave_muito_secreta_aqui
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# WhatsApp (opcional — requer empresa verificada na Meta)
WHATSAPP_ENABLED=false
WHATSAPP_API_URL=https://graph.facebook.com/v23.0
WHATSAPP_TOKEN=EAAxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 📡 Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Perfil |
| PUT | /api/auth/profile | Atualizar perfil |

### Booking (público — sem autenticação)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/booking/:slug | Perfil público + serviços |
| GET | /api/booking/:slug/slots?date=&service_id= | Horários disponíveis |
| POST | /api/booking/:slug | Criar agendamento |

### Horários de Funcionamento
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/working-hours | Buscar horários |
| POST | /api/working-hours | Salvar horários (upsert) |
| POST | /api/working-hours/complete-onboarding | Finalizar onboarding |

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
| POST | /api/appointments | Criar |
| PATCH | /api/appointments/:id/status | Atualizar status |
| DELETE | /api/appointments/:id | Remover |
| GET | /api/appointments/dashboard | Dados do dashboard |
| GET | /api/appointments/report?year=&month= | Relatório mensal |

---

## 🔗 Fluxo de Agendamento Público

```
Profissional compartilha:
  agendai-phi.vercel.app/agendar/barbearia-silva

Cliente acessa → escolhe serviço → escolhe data → escolhe horário
  → informa nome e telefone → agendamento confirmado

Profissional recebe:
  badge vermelho no menu + toast de notificação (polling a cada 30s)
```

---

## 🗄️ Schema do Banco

```
users           → profissionais (multi-tenant)
clients         → clientes de cada profissional
services        → serviços oferecidos
appointments    → agendamentos
working_hours   → horários de funcionamento por dia da semana
blocked_times   → bloqueios de horário
```

---

## 🔐 Segurança

- Senhas com bcrypt (salt 12)
- JWT com expiração configurável
- Middleware de auth em todas as rotas privadas
- Multi-tenant: todas as queries filtram por `user_id`
- Validação de conflito de horário na criação
- Rotas públicas de booking sem exposição de dados sensíveis

---

## 🎨 Nichos Suportados

| Nicho | Página de marketing |
|-------|---------------------|
| Barbearia | /para/barbearia |
| Clínica Estética | /para/clinica |
| Psicólogo | /para/psicologo |
| Nutricionista | /para/nutricionista |

---

## 📦 Deploy em Produção

| Serviço | Uso |
|---------|-----|
| [Railway](https://railway.app) | Backend + PostgreSQL |
| [Vercel](https://vercel.com) | Frontend React |

### Variáveis no Railway
```
DATABASE_URL        → gerada automaticamente
JWT_SECRET          → chave aleatória longa
FRONTEND_URL        → https://seu-app.vercel.app
WHATSAPP_ENABLED    → false
NODE_ENV            → production
```

### Variável na Vercel
```
REACT_APP_API_URL   → https://seu-backend.up.railway.app/api
```

---

## 📝 Licença

MIT — Livre para uso comercial e modificações.
