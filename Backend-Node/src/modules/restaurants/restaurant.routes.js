const { Router } = require('express');
const router = Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRestaurantAdmin } = require('../../middleware/role.middleware');

const { upload } = require('../../middleware/upload.middleware');

// All restaurant admin routes under /restaurantAdmin prefix with auth + role middleware
router.use(authenticate, requireRestaurantAdmin);

const reviewCtrl = require('../reviews/review.controller');
const complaintCtrl = require('../complaints/complaint.controller');
const productCtrl = require('../products/product.controller');
const orderCtrl = require('../orders/order.controller');
const businessCtrl = require('../businesses/business.controller');

router.get('/business', businessCtrl.showOwn);
router.put('/business', businessCtrl.updateOwn);
router.get('/get-reviews', reviewCtrl.index);
router.post('/review/:review_id/reply', reviewCtrl.reply);
router.put('/complaint-status', complaintCtrl.update);
router.get('/complaints', complaintCtrl.complaintsOfTown);
router.get('/allproducts', productCtrl.getProducts);
router.get('/orders', orderCtrl.viewRestaurantOrders);
router.post('/products/discount', productCtrl.updateDiscount);
router.get('/products/removeDiscount', productCtrl.removeDiscount);
router.post('/add-products', upload.single('image'), productCtrl.addProduct);
router.post('/products/:productId/apply-discount', productCtrl.applyDiscountToProduct);
router.patch('/products/:product/toggle-active', productCtrl.toggleActive);

module.exports = router;
