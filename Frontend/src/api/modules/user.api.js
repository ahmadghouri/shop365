import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const userApi = {
  update: (id, data) => http.put(ENDPOINTS.UPDATE_USER(id), data),
  deleteCleanup: () => http.delete(ENDPOINTS.DELETE_USERS),

  // Admin
  getAll: (params) => http.get(ENDPOINTS.ADMIN_USERS, { params }),
  getById: (id) => http.get(ENDPOINTS.ADMIN_USER(id)),
  delete: (id) => http.delete(ENDPOINTS.ADMIN_USER(id)),
  getRecentUsers: () => http.get(ENDPOINTS.ADMIN_USERS_RECENT),
  getGroceryUsers: (businessId) => http.get(ENDPOINTS.ADMIN_GROCERY_USERS(businessId)),

  // Vendor management
  createAdmin: (data) => http.post(ENDPOINTS.ADMIN_CREATE_ADMIN, data),
  getVendors: () => http.get(ENDPOINTS.ADMIN_VENDORS),
  updateAdmin: (id, data) => http.put(ENDPOINTS.ADMIN_UPDATE_ADMIN(id), data),
};
