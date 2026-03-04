const pool = require('../config/database');

// Verifica se o usuário tem acesso ativo (trial ou pro)
const planMiddleware = async (req, res, next) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT plan, trial_ends_at, plan_expires_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const now = new Date();

    // Plano Pro ativo
    if (user.plan === 'pro' && user.plan_expires_at && new Date(user.plan_expires_at) > now) {
      req.userPlan = 'pro';
      return next();
    }

    // Trial ativo (primeiros 30 dias)
    if (user.plan === 'trial' && user.trial_ends_at && new Date(user.trial_ends_at) > now) {
      req.userPlan = 'trial';
      return next();
    }

    // Acesso expirado
    return res.status(403).json({
      error: 'plan_expired',
      message: 'Seu período de acesso expirou. Assine o plano Pro para continuar.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = planMiddleware;
