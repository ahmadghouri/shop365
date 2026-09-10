const { Router } = require('express');
const ctrl = require('./rider.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole, requireRestaurantAdmin } = require('../../middleware/role.middleware');
const { upload } = require('../../middleware/upload.middleware');
const { UserRole } = require('../../common/enums');

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
// A rider removed by their provider is soft-deleted (deleted_at set) — gate the rider app on that
riderRouter.use(authenticate, requireRole(UserRole.RIDER));
riderRouter.use((req, res, next) => {
  if (req.user.deleted_at) return res.status(401).json({ message: 'Account no longer active' });
  next();
});
riderRouter.get('/orders', ctrl.riderOrders);
riderRouter.put('/orders/:id/status', ctrl.riderUpdateStatus);

module.exports = { vendorRouter, riderRouter };