require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { startReminderJob } = require('./utils/reminderJob');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ───────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (dev) ──────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ── Rotas ─────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'AgendAI API' }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ── Start ─────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 AgendAI Backend rodando na porta ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  startReminderJob();
});
