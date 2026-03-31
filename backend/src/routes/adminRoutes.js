// src/routes/admin.js
// Protegido por x-admin-key header (senha definida no .env como ADMIN_KEY)

const express = require('express');
const router  = express.Router();
const pool    = require('../config/database');

const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY)
    return res.status(401).json({ error: 'Acesso negado' });
  next();
};

// GET /api/admin/users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, email, business_name, plan,
             trial_ends_at, plan_expires_at, created_at, booking_slug
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/admin/summary
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const { rows: [s] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users)                                                       AS total_usuarios,
        (SELECT COUNT(*) FROM users WHERE plan = 'trial')                                  AS em_trial,
        (SELECT COUNT(*) FROM users WHERE plan = 'pro')                                    AS plano_pro,
        (SELECT COUNT(*) FROM users WHERE plan = 'trial' AND trial_ends_at < NOW())        AS trials_expirados,
        (SELECT COUNT(*) FROM appointments)                                                AS total_agendamentos,
        (SELECT COUNT(*) FROM appointments WHERE created_at > NOW() - INTERVAL '7 days')  AS agendamentos_7d
    `);
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/admin/activate — ativa ou renova Pro por 30 dias
router.post('/activate', adminAuth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });
  try {
    const { rows: [user] } = await pool.query(`
      UPDATE users
      SET plan = 'pro',
          plan_expires_at = GREATEST(COALESCE(plan_expires_at, NOW()), NOW()) + INTERVAL '30 days'
      WHERE email = $1
      RETURNING name, email, plan, plan_expires_at
    `, [email]);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
