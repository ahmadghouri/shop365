const { Router } = require('express');
const router = Router();
const ctrl = require('./household.controller');

router.put('/update/household', ctrl.update);

module.exports = router;
