module.exports = {
  UserRole: Object.freeze({
    END_USER: "end_user",
    ADMIN: "admin",
    RESTAURANT_ADMIN: "restaurant_admin",
    RIDER: "rider",
  }),
  OrderStatus: Object.freeze({
    PENDING: "pending",
    PREPARING: "preparing",
    ON_WAY: "on_way",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  }),
  ComplaintStatus: Object.freeze({
    PENDING: "pending",
    RESOLVED: "resolved",
    REJECTED: "rejected",
  }),
  PrescriptionStatus: Object.freeze({
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  }),
  DiscountType: Object.freeze({
    PERCENTAGE: "percentage",
    FLAT: "flat",
  }),
  BusinessStatus: Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
  }),
};
