const { Router } = require('express');
const router = Router();
const ctrl = require('./complaint.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/complaints', ctrl.index);
router.post('/complaints', authenticate, ctrl.store);
router.get('/complaints/:id', ctrl.show);
router.put('/complaints/:id', ctrl.update);
router.delete('/complaints/:id', ctrl.destroy);

module.exports = router;
