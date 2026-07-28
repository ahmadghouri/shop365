import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const cartApi = {
  add: (data) => http.post(ENDPOINTS.CART, data),
  getAll: () => http.get(ENDPOINTS.CART),
  remove: (id) => http.delete(ENDPOINTS.CART_ITEM(id)),
  removeProduct: (id) => http.delete(ENDPOINTS.CART_PRODUCT(id)),
  updateQuantity: (id, data) => http.patch(ENDPOINTS.CART_UPDATE(id), data),
  getItemCount: () => http.get(ENDPOINTS.CART_ITEM_COUNT),
  applyVoucher: (data) => http.post(ENDPOINTS.CART_APPLY_VOUCHER, data),
};
