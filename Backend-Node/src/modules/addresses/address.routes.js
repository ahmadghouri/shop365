const { Router } = require('express');
const router = Router();
const ctrl = require('./address.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/addresses', ctrl.list);
router.post('/addresses', ctrl.create);
router.put('/addresses/:id/activate', ctrl.activate);
router.put('/addresses/:id', ctrl.update);
router.delete('/addresses/:id', ctrl.remove);

module.exports = router;
