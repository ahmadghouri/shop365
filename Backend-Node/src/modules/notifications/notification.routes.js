const { Router } = require('express');
const router = Router();
const { authenticate } = require('../../middleware/auth.middleware');
const ctrl = require('./notification.controller');

router.get('/notification', authenticate, ctrl.index);
router.put('/notification/read-all', authenticate, ctrl.markAllRead);
router.put('/notification/:id/read', authenticate, ctrl.markRead);

module.exports = router;