const { Router } = require('express');
const router = Router();
const ctrl = require('./pos-product.controller');

router.get('/pos-products', ctrl.index);
router.post('/pos-products/import', ctrl.importProducts);

module.exports = router;
