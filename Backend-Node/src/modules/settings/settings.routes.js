const { Router } = require('express');
const router = Router();
const ctrl = require('./settings.controller');

// Public — mobile app reads delivery_fee + min_order_price without auth
router.get('/settings', ctrl.getSettings);

module.exports = router;
