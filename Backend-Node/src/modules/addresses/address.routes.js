const { Router } = require('express');
const router = Router();
const ctrl = require('./address.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Auth is applied per-route (not router-wide) — a path-less router.use() on a
// router mounted at '/api' runs for EVERY /api/* request, which was wrongly
// blocking unrelated routes like POST /api/rider/login.
router.get('/addresses', authenticate, ctrl.list);
router.post('/addresses', authenticate, ctrl.create);
router.put('/addresses/:id/activate', authenticate, ctrl.activate);
router.put('/addresses/:id', authenticate, ctrl.update);
router.delete('/addresses/:id', authenticate, ctrl.remove);

module.exports = router;
