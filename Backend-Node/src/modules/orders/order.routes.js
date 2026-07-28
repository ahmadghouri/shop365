const { Router } = require('express');
const router = Router();
const ctrl = require('./order.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Laravel: Route::prefix('order')->group(function () { ... });
router.post('/order', authenticate, ctrl.placeOrder);
router.get('/order', authenticate, ctrl.viewOrders);

// Non-auth order routes
router.put('/orders/:id/status', ctrl.updateStatus);
router.get('/orders/:id', ctrl.show);
router.post('/reorder/:order', authenticate, ctrl.reorder);
router.delete('/orders/delete-all', ctrl.deleteAllOrders);

module.exports = router;
