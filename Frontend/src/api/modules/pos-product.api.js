import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const posProductApi = {
  getAll: (params) => http.get(ENDPOINTS.POS_PRODUCTS, { params }),
  import: (data) => http.post(ENDPOINTS.POS_PRODUCTS_IMPORT, data),
};
