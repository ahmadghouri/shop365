const { Router } = require('express');
const ctrl = require('./category.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

const router = Router();

router.get('/categories', ctrl.index);
router.get('/categories/:id', ctrl.show);
router.post('/categories', authenticate, requireAdmin, ctrl.store);
router.put('/categories/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/categories/:id', authenticate, requireAdmin, ctrl.destroy);

module.exports = router;
