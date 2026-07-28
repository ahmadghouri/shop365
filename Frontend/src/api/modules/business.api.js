import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const businessApi = {
  getAll: () => http.get(ENDPOINTS.BUSINESSES),
  getById: (id) => http.get(ENDPOINTS.BUSINESS(id)),
  create: (data) => http.post(ENDPOINTS.BUSINESSES, data),
  update: (id, data) => http.put(ENDPOINTS.BUSINESS(id), data),
  delete: (id) => http.delete(ENDPOINTS.BUSINESS(id)),
  getSubBusinesses: (id) => http.get(ENDPOINTS.SUB_BUSINESSES(id)),
  getNumber: (id) => http.get(ENDPOINTS.BUSINESS_NUMBER(id)),
  getStats: (params) => http.get(ENDPOINTS.ADMIN_BUSINESS_STATS, { params }),
};
