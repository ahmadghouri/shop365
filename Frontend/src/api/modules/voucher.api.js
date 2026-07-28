import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const voucherApi = {
  apply: (data) => http.post(ENDPOINTS.APPLY_VOUCHER, data),

  // Admin
  create: (data) => http.post(ENDPOINTS.ADMIN_CREATE_VOUCHER, data),
  getAll: () => http.get(ENDPOINTS.ADMIN_GET_VOUCHERS),
  delete: (id) => http.delete(ENDPOINTS.ADMIN_DELETE_VOUCHER(id)),
};
