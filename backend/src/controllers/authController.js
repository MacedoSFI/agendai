const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const pool   = require('../config/database');

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
    + '-' + crypto.randomBytes(3).toString('hex');
}

const register = async (req, res) => {
  const { name, email, password, phone, profession, business_name } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email já cadastrado' });
    const password_hash = await bcrypt.hash(password, 12);
    const slug = generateSlug(business_name || name);
    const { rows: [user] } = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, profession, business_name, booking_slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name, email, profession, business_name, booking_slug`,
      [name, email, password_hash, phone, profession, business_name, slug]
    );
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows: [user] } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT id, name, email, phone, profession, business_name, avatar_url, timezone, booking_slug FROM users WHERE id = $1',
      [req.userId]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone, profession, business_name, whatsapp_token, whatsapp_phone_id } = req.body;
  try {
    const { rows: [user] } = await pool.query(
      `UPDATE users SET name=$1, phone=$2, profession=$3, business_name=$4,
       whatsapp_token=$5, whatsapp_phone_id=$6
       WHERE id=$7
       RETURNING id, name, email, phone, profession, business_name, booking_slug`,
      [name, phone, profession, business_name, whatsapp_token, whatsapp_phone_id, req.userId]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const forgotPassword = async (req, res) => {
  res.json({ support: true });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token e senha obrigatórios' });
  if (password.length < 8)  return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
  try {
    const { rows: [reset] } = await pool.query(
      `SELECT * FROM password_resets WHERE token=$1 AND used=false AND expires_at > NOW()`, [token]
    );
    if (!reset) return res.status(400).json({ error: 'Link inválido ou expirado.' });
    const password_hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [password_hash, reset.user_id]);
    await pool.query('UPDATE password_resets SET used=true WHERE id=$1', [reset.id]);
    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getPlanStatus = async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT plan, trial_ends_at, plan_expires_at FROM users WHERE id = $1', [req.userId]
    );
    const now      = new Date();
    const trialEnd = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const planEnd  = user.plan_expires_at ? new Date(user.plan_expires_at) : null;
    const isPro    = user.plan === 'pro' && planEnd && planEnd > now;
    const isTrial  = user.plan === 'trial' && trialEnd && trialEnd > now;
    const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - now) / 86400000)) : 0;
    res.json({
      plan: isPro ? 'pro' : (isTrial ? 'trial' : 'expired'),
      trial_ends_at:   user.trial_ends_at,
      plan_expires_at: user.plan_expires_at,
      trial_days_left: trialDaysLeft,
      is_active:       isPro || isTrial,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword, getPlanStatus };
