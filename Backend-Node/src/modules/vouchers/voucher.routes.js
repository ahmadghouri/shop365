const { Router } = require('express');
const router = Router();
const ctrl = require('./voucher.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/cart/apply-voucher', authenticate, ctrl.applyVoucher);
router.post('/vouchers', ctrl.store);
router.get('/vouchers', ctrl.getVoucher);
router.delete('/vouchers/:id', ctrl.deleteVoucher);
router.get('/vouchers/verify/:code', authenticate, ctrl.verifyCode);

module.exports = router;
