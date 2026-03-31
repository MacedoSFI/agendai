// src/routes/quotes.js
const express     = require('express');
const router      = express.Router();
const auth        = require('../middleware/auth');
const plan        = require('../middleware/planMiddleware');
const validateUUID = require('../middleware/validateUUID');
const ctrl        = require('../controllers/quotesController');

// ── Públicas (sem auth) ───────────────────────
router.get ('/public/quote-template/:templateId', validateUUID('templateId'), ctrl.getPublicTemplate);
router.post('/public/quotes',                                                  ctrl.createQuote);

// ── Protegidas (auth + plano Pro) ─────────────
router.get   ('/quotes/templates',              auth, plan, ctrl.getTemplates);
router.post  ('/quotes/templates',              auth, plan, ctrl.createTemplate);
router.put   ('/quotes/templates/:id',          auth, plan, validateUUID(), ctrl.updateTemplate);
router.delete('/quotes/templates/:id',          auth, plan, validateUUID(), ctrl.deleteTemplate);

router.get   ('/quotes',                        auth, plan, ctrl.getQuotes);
router.post  ('/quotes',                        auth, plan, ctrl.createQuote);
router.get   ('/quotes/:id',                    auth, plan, validateUUID(), ctrl.getQuote);
router.patch ('/quotes/:id/status',             auth, plan, validateUUID(), ctrl.updateStatus);
router.post  ('/quotes/:id/convert',            auth, plan, validateUUID(), ctrl.convertToAppointment);

module.exports = router;
