const { Router } = require('express');
const router = Router();
const ctrl = require('./town.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/towns', ctrl.index);
router.post('/towns', ctrl.store);
router.get('/towns/:id', ctrl.show);
router.put('/towns/:id', ctrl.update);
router.delete('/towns/:id', ctrl.destroy);

// Laravel puts get-towns under auth:sanctum
router.get('/get-towns', authenticate, ctrl.index);

module.exports = router;
