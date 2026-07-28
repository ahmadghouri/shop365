module.exports = {
  UserRole: Object.freeze({
    END_USER: 'end_user',
    ADMIN: 'admin',
    RESTAURANT_ADMIN: 'restaurant_admin',
  }),
  OrderStatus: Object.freeze({
    PENDING: 'pending',
    PREPARING: 'preparing',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
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
