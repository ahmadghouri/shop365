const { Router } = require('express');
const router = Router();
const ctrl = require('./review.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/reviews', authenticate, ctrl.store);
router.post('/rider-reviews', authenticate, ctrl.storeRiderReview);
// Must be before '/reviews/:business_id' so it isn't captured as a param.
router.get('/my-reviews', authenticate, ctrl.myReviews);
router.get('/reviews/:business_id', authenticate, ctrl.index);
router.delete('/reviews/:id', ctrl.destroy);

module.exports = router;
