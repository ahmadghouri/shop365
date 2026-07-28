const { Router } = require('express');
const router = Router();
const ctrl = require('./perscription.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/prescription', authenticate, ctrl.store);

module.exports = router;
