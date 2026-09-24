const { Router } = require('express');
const router = Router();
const ctrl = require('./admin.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

// All admin routes under /admin prefix with auth + admin middleware
router.use(authenticate, requireAdmin);

router.post('/create-voucher', ctrl.createVoucher);
router.get('/get-voucher', ctrl.getVoucher);
router.delete('/voucher/:id/delete', ctrl.deleteVoucher);
router.get('/business-orders/:id', ctrl.superAdminOrders);
router.get('/grocery/:id', ctrl.getGroceryOrders);
router.get('/business-stats', ctrl.getBusinessStats);
router.post('/providers', ctrl.createProvider);
router.post('/createAdmins', ctrl.createTownAdmin);
router.get('/internship-applications', ctrl.internshipApplications);
router.get('/rider-applications', ctrl.riderApplications);
router.get('/rider-applications/:id', ctrl.riderApplicationShow);
router.put('/rider-applications/:id/status', ctrl.updateRiderApplicationStatus);
router.put('/rider-applications/:id/document', ctrl.updateRiderDocumentStatus);
router.put('/rider-applications/:id/message', ctrl.updateRiderApplicationMessage);
router.get('/users/previous-two-days', ctrl.usersPreviousTwoDays);
router.get('/users', ctrl.usersIndex);
router.get('/users/:id', ctrl.usersShow);
router.delete('/users/:id', ctrl.usersDestroy);
router.get('/vendors', ctrl.getVendors);
router.put('/admins/:id', ctrl.updateAdmin);

module.exports = router;
