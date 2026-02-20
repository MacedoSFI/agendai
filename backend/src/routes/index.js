const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const clientsCtrl = require('../controllers/clientsController');
const servicesCtrl = require('../controllers/servicesController');
const apptCtrl = require('../controllers/appointmentsController');

// ── Auth ──────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/profile', auth, authCtrl.getProfile);
router.put('/auth/profile', auth, authCtrl.updateProfile);

// ── Clients ───────────────────────────────────
router.get('/clients', auth, clientsCtrl.getAll);
router.get('/clients/:id', auth, clientsCtrl.getOne);
router.post('/clients', auth, clientsCtrl.create);
router.put('/clients/:id', auth, clientsCtrl.update);
router.delete('/clients/:id', auth, clientsCtrl.remove);
router.get('/clients/:id/history', auth, clientsCtrl.getHistory);

// ── Services ──────────────────────────────────
router.get('/services', auth, servicesCtrl.getAll);
router.post('/services', auth, servicesCtrl.create);
router.put('/services/:id', auth, servicesCtrl.update);
router.delete('/services/:id', auth, servicesCtrl.remove);

// ── Appointments ──────────────────────────────
router.get('/appointments', auth, apptCtrl.getAll);
router.get('/appointments/report', auth, apptCtrl.getReport);
router.get('/appointments/dashboard', auth, apptCtrl.getDashboard);
router.get('/appointments/:id', auth, apptCtrl.getOne);
router.post('/appointments', auth, apptCtrl.create);
router.patch('/appointments/:id/status', auth, apptCtrl.updateStatus);
router.delete('/appointments/:id', auth, apptCtrl.remove);

module.exports = router;
