const pool = require('../config/database');

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

    // Trial ativo — verifica limite de 30 agendamentos nos últimos 30 dias
    if (user.plan === 'trial' && user.trial_ends_at && new Date(user.trial_ends_at) > now) {
      // Só aplica o limite em rotas de criação de agendamento
      const isCreatingAppointment = req.method === 'POST' && req.path === '/appointments';
      if (isCreatingAppointment) {
        const { rows: [count] } = await pool.query(
          `SELECT COUNT(*) FROM appointments
           WHERE user_id = $1
             AND created_at >= NOW() - INTERVAL '30 days'`,
          [req.userId]
        );
        if (parseInt(count.count) >= 30) {
          return res.status(403).json({
            error: 'trial_limit',
            message: 'Você atingiu o limite de 30 agendamentos do plano gratuito. Assine o plano Pro para continuar.',
          });
        }
      }
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
