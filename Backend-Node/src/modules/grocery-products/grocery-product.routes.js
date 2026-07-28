const { Router } = require('express');
const router = Router();
const ctrl = require('./grocery-product.controller');

router.post('/import-grocery-products', ctrl.storeGroceryProducts);

module.exports = router;
