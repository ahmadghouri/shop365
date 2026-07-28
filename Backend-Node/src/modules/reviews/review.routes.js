const { Router } = require('express');
const router = Router();
const ctrl = require('./review.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/reviews', authenticate, ctrl.store);
router.get('/reviews/:business_id', authenticate, ctrl.index);
router.delete('/reviews/:id', ctrl.destroy);

module.exports = router;
