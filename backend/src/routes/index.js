const express      = require('express');
const router       = express.Router();
const pool         = require('../config/database');
const auth         = require('../middleware/auth');
const plan         = require('../middleware/planMiddleware');
const validateUUID = require('../middleware/validateUUID');
const { loginLimiter, registerLimiter, bookingLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiters');
const authCtrl     = require('../controllers/authController');
const clientsCtrl  = require('../controllers/clientsController');
const servicesCtrl = require('../controllers/servicesController');
const apptCtrl     = require('../controllers/appointmentsController');

// ── Auth ──────────────────────────────────────
router.post('/auth/register',        registerLimiter,       authCtrl.register);
router.post('/auth/login',           loginLimiter,          authCtrl.login);
router.get ('/auth/profile',         auth,                  authCtrl.getProfile);
router.put ('/auth/profile',         auth,                  authCtrl.updateProfile);
router.post('/auth/forgot-password', forgotPasswordLimiter, authCtrl.forgotPassword);
router.post('/auth/reset-password',                         authCtrl.resetPassword);
router.get ('/auth/plan',            auth,                  authCtrl.getPlanStatus);
router.put ('/auth/password',        auth,                  authCtrl.changePassword);

// ── Push notifications ────────────────────────
router.get('/push/vapid-public-key', auth, (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/push/subscribe', auth, async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth)
    return res.status(400).json({ error: 'Subscription inválida' });
  // Valida tamanho máximo para prevenir payload abuse
  if (endpoint.length > 500 || keys.p256dh.length > 200 || keys.auth.length > 100)
    return res.status(400).json({ error: 'Subscription inválida' });
  try {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, endpoint) DO NOTHING`,
      [req.userId, endpoint, keys.p256dh, keys.auth]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/push/unsubscribe', auth, async (req, res) => {
  const { endpoint } = req.body;
  try {
    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [req.userId, endpoint]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── Booking público ───────────────────────────
const bookingRouter = require('./booking');
router.use('/booking', bookingLimiter, bookingRouter);

// ── Working Hours ─────────────────────────────
const workingHoursRouter = require('./workingHours');
router.use('/working-hours', workingHoursRouter);

// ── Painel Admin ─────────────────────────────
const adminRouter = require('./admin');
router.use('/admin', adminRouter);

// ── Rotas protegidas por auth + plano ─────────
router.get   ('/clients',                        auth, plan, clientsCtrl.getAll);
router.get   ('/clients/:id',    validateUUID(), auth, plan, clientsCtrl.getOne);
router.post  ('/clients',                        auth, plan, clientsCtrl.create);
router.put   ('/clients/:id',    validateUUID(), auth, plan, clientsCtrl.update);
router.delete('/clients/:id',    validateUUID(), auth, plan, clientsCtrl.remove);
router.get   ('/clients/:id/history', validateUUID(), auth, plan, clientsCtrl.getHistory);

router.get   ('/services',                       auth, plan, servicesCtrl.getAll);
router.post  ('/services',                       auth, plan, servicesCtrl.create);
router.put   ('/services/:id',   validateUUID(), auth, plan, servicesCtrl.update);
router.delete('/services/:id',   validateUUID(), auth, plan, servicesCtrl.remove);

router.get   ('/appointments',                        auth, plan, apptCtrl.getAll);
router.get   ('/appointments/report',                 auth, plan, apptCtrl.getReport);
router.get   ('/appointments/dashboard',              auth, plan, apptCtrl.getDashboard);
router.get   ('/appointments/:id',    validateUUID(), auth, plan, apptCtrl.getOne);
router.post  ('/appointments',                        auth, plan, apptCtrl.create);
router.patch ('/appointments/:id/status', validateUUID(), auth, plan, apptCtrl.updateStatus);
router.delete('/appointments/:id',    validateUUID(), auth, plan, apptCtrl.remove);

module.exports = router;
