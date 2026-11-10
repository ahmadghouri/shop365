const { Router } = require('express');
const ctrl = require('./rider.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRestaurantAdmin } = require('../../middleware/role.middleware');
const { authenticateRider } = require('../../middleware/rider-auth.middleware');
const { upload } = require('../../middleware/upload.middleware');
const { cloudinaryUpload } = require('../../middleware/cloudinary-upload.middleware');
const appCtrl = require('../rider-applications/rider-application.controller');

const riderDocs = cloudinaryUpload.fields([
  { name: 'cnic_front_image', maxCount: 1 },
  { name: 'cnic_back_image', maxCount: 1 },
  { name: 'photo_image', maxCount: 1 },
  { name: 'vehicle_image', maxCount: 1 },
]);

// Vendor dashboard: /api/restaurantAdmin/riders
// Providers manage only riders of their own restaurant (business_id comes from req.user)
const vendorRouter = Router();
vendorRouter.use(authenticate, requireRestaurantAdmin);
vendorRouter.get('/riders', ctrl.index);
// Adding a rider sends a request to the admin (rider application); the rider
// account is created on approval. Status is listed via /rider-requests.
vendorRouter.post('/riders', riderDocs, appCtrl.storeFromBusiness);
vendorRouter.get('/rider-requests', appCtrl.businessRequests);
vendorRouter.put('/riders/:id', upload.single('image'), ctrl.update);
vendorRouter.patch('/riders/:id/toggle', ctrl.toggleActive);
vendorRouter.delete('/riders/:id', ctrl.remove);

// Rider mobile app: /api/rider
const riderRouter = Router();

// Public — rider/driver app login (no register; riders can't self-register).
riderRouter.post('/login', ctrl.riderLogin);

// Everything below requires an authenticated, active rider (self-contained auth).
riderRouter.use(authenticateRider);
riderRouter.get('/orders', ctrl.riderOrders);
// Past deliveries + today's / total earnings
riderRouter.get('/orders/history', ctrl.riderOrderHistory);
// Earnings, cash collected and recent earning entries
riderRouter.get('/wallet', ctrl.riderWallet);
// Rider's own profile
riderRouter.get('/me', ctrl.riderMe);
riderRouter.put('/me/password', ctrl.riderChangePassword);
riderRouter.put('/me/photo', upload.single('image'), ctrl.riderUpdatePhoto);
riderRouter.put('/orders/:id/status', ctrl.riderUpdateStatus);
// Rider drops a delivery with a reason (goes to the restaurant / admin to decide).
riderRouter.post('/orders/:id/cancel', ctrl.riderCancelDelivery);
// Rider pushes live GPS location (broadcast to active orders' customers).
riderRouter.post('/location', ctrl.riderUpdateLocation);

module.exports = { vendorRouter, riderRouter };