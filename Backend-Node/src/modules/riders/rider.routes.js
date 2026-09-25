const { Router } = require('express');
const ctrl = require('./rider.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRestaurantAdmin } = require('../../middleware/role.middleware');
const { authenticateRider } = require('../../middleware/rider-auth.middleware');
const { upload } = require('../../middleware/upload.middleware');

// Vendor dashboard: /api/restaurantAdmin/riders
// Providers manage only riders of their own restaurant (business_id comes from req.user)
const vendorRouter = Router();
vendorRouter.use(authenticate, requireRestaurantAdmin);
vendorRouter.get('/riders', ctrl.index);
vendorRouter.post('/riders', upload.single('image'), ctrl.create);
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
riderRouter.put('/orders/:id/status', ctrl.riderUpdateStatus);
// Rider pushes live GPS location (broadcast to active orders' customers).
riderRouter.post('/location', ctrl.riderUpdateLocation);

module.exports = { vendorRouter, riderRouter };