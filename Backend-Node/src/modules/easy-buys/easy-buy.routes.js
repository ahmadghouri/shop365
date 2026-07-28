const { Router } = require('express');
const router = Router();
const ctrl = require('./easy-buy.controller');

router.post('/easy-buy', ctrl.store);
router.post('/easy-buy/filters', ctrl.filters);
router.get('/easy-buy', ctrl.index);
router.get('/easy-buy/:id', ctrl.show);
router.put('/easy-buy/:id', ctrl.update);
router.delete('/easy-buy/:id', ctrl.destroy);
router.post('/resolve-product', ctrl.resolveProduct);

module.exports = router;
