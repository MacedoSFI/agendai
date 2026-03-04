const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'felipe.tech.brasil@gmail.com';

const register = async (req, res) => {
  const { name, email, password, phone, profession, business_name } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, profession, business_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, profession, business_name`,
      [name, email, password_hash, phone, profession, business_name]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, profession, business_name, avatar_url, timezone FROM users WHERE id = $1',
      [req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone, profession, business_name, whatsapp_token, whatsapp_phone_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, phone=$2, profession=$3, business_name=$4,
       whatsapp_token=$5, whatsapp_phone_id=$6
       WHERE id=$7
       RETURNING id, name, email, phone, profession, business_name`,
      [name, phone, profession, business_name, whatsapp_token, whatsapp_phone_id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });
  try {
    const { rows: [user] } = await pool.query(
      'SELECT id, name FROM users WHERE email = $1', [email]
    );
    if (!user) {
      return res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções em breve.' });
    }

    await pool.query('UPDATE password_resets SET used = true WHERE user_id = $1', [user.id]);
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)',
      [user.id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Resend plano gratuito só envia para o email verificado (ADMIN_EMAIL).
    // Se o usuário for o próprio admin, envia direto.
    // Se for outro usuário, envia para o admin com o link para encaminhar.
    const isAdmin = email === ADMIN_EMAIL;

    const emailResult = await resend.emails.send({
      from:    'AgendAI <onboarding@resend.dev>',
      to:      ADMIN_EMAIL,
      subject: isAdmin
        ? 'Redefinição de senha — AgendAI'
        : `[AgendAI] Reset solicitado por ${user.name} (${email})`,
      html: isAdmin ? `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#7c6af7">AgendAI</h2>
          <p>Olá, <strong>${user.name}</strong>!</p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c6af7,#4fd1c5);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Redefinir minha senha
          </a>
          <p style="color:#888;font-size:13px">Link expira em <strong>1 hora</strong>.</p>
        </div>
      ` : `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#7c6af7">AgendAI — Reset de Senha</h2>
          <p>O usuário <strong>${user.name}</strong> solicitou redefinição de senha.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Encaminhe o link abaixo para o usuário:</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:14px 28px;background:linear-gradient(135deg,#7c6af7,#4fd1c5);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Link de redefinição
          </a>
          <p style="color:#888;font-size:13px">Expira em <strong>1 hora</strong>.</p>
          <p style="color:#aaa;font-size:11px;word-break:break-all">URL: ${resetUrl}</p>
        </div>
      `,
    });
console.log('Resend result:', JSON.stringify(emailResult));
    res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções em breve.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar email. Tente novamente.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token e senha obrigatórios' });
  if (password.length < 8)  return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
  try {
    const { rows: [reset] } = await pool.query(
      `SELECT * FROM password_resets WHERE token=$1 AND used=false AND expires_at > NOW()`,
      [token]
    );
    if (!reset) return res.status(400).json({ error: 'Link inválido ou expirado. Solicite um novo.' });
    const password_hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [password_hash, reset.user_id]);
    await pool.query('UPDATE password_resets SET used=true WHERE id=$1', [reset.id]);
    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };
