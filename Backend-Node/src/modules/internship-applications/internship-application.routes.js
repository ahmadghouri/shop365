const { Router } = require('express');
const router = Router();
const ctrl = require('./internship-application.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/internship/apply', authenticate, ctrl.store);
router.get('/internship-applications', ctrl.index);

module.exports = router;
