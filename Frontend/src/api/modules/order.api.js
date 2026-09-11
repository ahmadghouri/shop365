import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const orderApi = {
  place: (data) => http.post(ENDPOINTS.ORDER, data),
  getAll: () => http.get(ENDPOINTS.ORDER),
  getById: (id) => http.get(ENDPOINTS.ORDERS(id)),
  updateStatus: (id, data) => http.put(ENDPOINTS.ORDER_STATUS(id), data),
  reorder: (orderId) => http.post(ENDPOINTS.REORDER(orderId)),
  deleteAll: () => http.delete(ENDPOINTS.DELETE_ALL_ORDERS),

  // Restaurant admin
  getRestaurantOrders: (params) =>
    http.get(ENDPOINTS.RESTAURANT_ORDERS, { params }),
  assignRider: (id, data) =>
    http.post(ENDPOINTS.RESTAURANT_ASSIGN_RIDER(id), data),

  // Super admin
  getBusinessOrders: (id) => http.get(ENDPOINTS.ADMIN_BUSINESS_ORDERS(id)),
  getGroceryUsers: (id) => http.get(ENDPOINTS.ADMIN_GROCERY_USERS(id)),
};
