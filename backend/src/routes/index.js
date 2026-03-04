const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const plan    = require('../middleware/planMiddleware');
const authCtrl     = require('../controllers/authController');
const clientsCtrl  = require('../controllers/clientsController');
const servicesCtrl = require('../controllers/servicesController');
const apptCtrl     = require('../controllers/appointmentsController');

// ── Auth (sem restrição de plano) ─────────────
router.post('/auth/register',         authCtrl.register);
router.post('/auth/login',            authCtrl.login);
router.get ('/auth/profile',    auth, authCtrl.getProfile);
router.put ('/auth/profile',    auth, authCtrl.updateProfile);
router.post('/auth/forgot-password',  authCtrl.forgotPassword);
router.post('/auth/reset-password',   authCtrl.resetPassword);
router.get ('/auth/plan',       auth, authCtrl.getPlanStatus);

// ── Booking público (sem auth, sem restrição) ──
const bookingRouter = require('./booking');
router.use('/booking', bookingRouter);

// ── Working Hours ──────────────────────────────
const workingHoursRouter = require('./workingHours');
router.use('/working-hours', workingHoursRouter);

// ── Rotas protegidas por auth + plano ──────────
router.get   ('/clients',              auth, plan, clientsCtrl.getAll);
router.get   ('/clients/:id',          auth, plan, clientsCtrl.getOne);
router.post  ('/clients',              auth, plan, clientsCtrl.create);
router.put   ('/clients/:id',          auth, plan, clientsCtrl.update);
router.delete('/clients/:id',          auth, plan, clientsCtrl.remove);
router.get   ('/clients/:id/history',  auth, plan, clientsCtrl.getHistory);

router.get   ('/services',             auth, plan, servicesCtrl.getAll);
router.post  ('/services',             auth, plan, servicesCtrl.create);
router.put   ('/services/:id',         auth, plan, servicesCtrl.update);
router.delete('/services/:id',         auth, plan, servicesCtrl.remove);

router.get   ('/appointments',              auth, plan, apptCtrl.getAll);
router.get   ('/appointments/report',       auth, plan, apptCtrl.getReport);
router.get   ('/appointments/dashboard',    auth, plan, apptCtrl.getDashboard);
router.get   ('/appointments/:id',          auth, plan, apptCtrl.getOne);
router.post  ('/appointments',              auth, plan, apptCtrl.create);
router.patch ('/appointments/:id/status',   auth, plan, apptCtrl.updateStatus);
router.delete('/appointments/:id',          auth, plan, apptCtrl.remove);

module.exports = router;
