const { Router } = require('express');
const router = Router();
const ctrl = require('./cart.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/cart', authenticate, ctrl.addToCart);
router.get('/cart', authenticate, ctrl.viewCart);
router.delete('/cart', authenticate, ctrl.clearCart);
router.delete('/cart/:id', authenticate, ctrl.removeCart);
router.delete('/cart/product/:id', authenticate, ctrl.removeProduct);
router.delete('/cart/vendor/:businessId', authenticate, ctrl.removeVendorItems);
router.patch('/cart/update/:id', authenticate, ctrl.updateQuantity);
router.get('/cart/item-count', authenticate, ctrl.getItemCount);

module.exports = router;
