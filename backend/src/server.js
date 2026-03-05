require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const routes     = require('./routes');
const { startReminderJob } = require('./utils/reminderJob');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Segurança: headers HTTP ───────────────────
app.use(helmet({
  crossOriginResourcePolicy: false, // necessário para o Vercel
}));

// ── CORS ──────────────────────────────────────
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

// ── Rate limiting global ──────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
}));

// ── Body parsing ──────────────────────────────
app.use(express.json({ limit: '64kb' })); // limita payload
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// ── Log em desenvolvimento ────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.use('/api', routes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'AgendAI API' }));
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// ── Error handler — sem stack trace em produção
app.use((err, _req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  else console.error(err.message);
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
