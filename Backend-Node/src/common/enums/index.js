module.exports = {
  UserRole: Object.freeze({
    END_USER: 'end_user',
    ADMIN: 'admin',
    RESTAURANT_ADMIN: 'restaurant_admin',
    RIDER: 'rider',
  }),
  OrderStatus: Object.freeze({
    PENDING:          'pending',
    CONFIRMED:        'confirmed',
    PREPARING:        'preparing',
    PICKED_UP:        'picked_up',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED:        'delivered',
    CANCELLED:        'cancelled',
  }),
  ComplaintStatus: Object.freeze({
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
  }),
  PrescriptionStatus: Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  }),
  DiscountType: Object.freeze({
    PERCENTAGE: 'percentage',
    FLAT: 'flat',
  }),
  BusinessStatus: Object.freeze({
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  }),
};
