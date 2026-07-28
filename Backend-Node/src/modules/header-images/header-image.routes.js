const { Router } = require('express');
const router = Router();
const ctrl = require('./header-image.controller');

router.get('/header-images', ctrl.index);
router.post('/header-images', ctrl.store);
router.get('/header-images/:id', ctrl.show);
router.put('/header-images/:id', ctrl.update);
router.delete('/header-images/:id', ctrl.destroy);
router.post('/header-images/reorder', ctrl.reorder);

module.exports = router;
