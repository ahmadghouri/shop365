const { Router } = require('express');
const router = Router();
const ctrl = require('./business.controller');

router.get('/business', ctrl.index);
router.post('/business', ctrl.store);
router.get('/business/:id', ctrl.show);
router.put('/business/:id', ctrl.update);
router.delete('/business/:id', ctrl.destroy);
router.get('/business/:businessId/sub-businesses', ctrl.getChildBusiness);
router.get('/getNumber/:businessId', ctrl.getNumber);

module.exports = router;
