const { Router } = require('express');
const router = Router();
const ctrl = require('./product.controller');
const { upload } = require('../../middleware/upload.middleware');

// Laravel: Route::apiResource('/products', ProductController::class);
router.get('/categories/:categoryId/products', ctrl.categoryProducts);
router.get('/products', ctrl.index);
router.post('/products', ctrl.store);
router.get('/products/:id', ctrl.show);
router.put('/products/:id', upload.single('image'), ctrl.update);
router.delete('/products/:id', ctrl.destroy);

// Additional product routes matching Laravel
router.post('/product/:id/status', ctrl.updateStatus);
router.get('/all-products/:businessId', ctrl.businessProducts);
router.get('/all-products/:businessId/admin', ctrl.businessAdminsProducts);
router.get('/random-products', ctrl.randomProductsByBusiness);
router.get('/business/:businessId/products', ctrl.businessProductsDiscount);
router.get('/businessTypes/:businessId', ctrl.businessProductsTypes);
router.get('/products/:businessId/filtered', ctrl.businessProductsFiltered);
router.post('/update-grocery-business-id', ctrl.updateGroceryBusinessId);
router.delete('/delete-products/:businessId', ctrl.deleteTodayProductsByBusinessId);

module.exports = router;
