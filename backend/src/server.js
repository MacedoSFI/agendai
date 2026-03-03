require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { startReminderJob } = require('./utils/reminderJob');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.use('/api', routes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'AgendAI API' }));
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 AgendAI Backend rodando na porta ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  if (process.env.WHATSAPP_ENABLED === 'true') {
    startReminderJob();
    console.log('📱 WhatsApp: ativado');
  } else {
    console.log('📱 WhatsApp: desativado');
  }
});
