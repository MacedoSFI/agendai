const rateLimit = require('express-rate-limit');

// Login — 10 tentativas por 15min por IP
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registro — 5 contas por hora por IP
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Muitos cadastros deste IP. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Booking público — 20 agendamentos por hora por IP
exports.bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas requisições de agendamento. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot password — 5 por hora por IP
exports.forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas. Aguarde 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});
