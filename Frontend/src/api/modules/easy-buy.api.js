import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const easyBuyApi = {
  getAll: () => http.get(ENDPOINTS.EASY_BUY),
  getById: (id) => http.get(ENDPOINTS.EASY_BUY_ITEM(id)),
  create: (data, config) => http.post(ENDPOINTS.EASY_BUY, data, config),
  update: (id, data) => http.put(ENDPOINTS.EASY_BUY_ITEM(id), data),
  updateWithFormData: (id, data, config) => http.post(ENDPOINTS.EASY_BUY_ITEM(id), data, config),
  delete: (id) => http.delete(ENDPOINTS.EASY_BUY_ITEM(id)),
  filters: (data) => http.post(ENDPOINTS.EASY_BUY_FILTERS, data),
  resolveProduct: (data) => http.post(ENDPOINTS.RESOLVE_PRODUCT, data),
};
