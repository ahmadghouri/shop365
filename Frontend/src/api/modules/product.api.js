import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const productApi = {
  getAll: (params) => http.get(ENDPOINTS.PRODUCTS, { params }),
  getById: (id, params) => http.get(ENDPOINTS.PRODUCT(id), { params }),
  create: (data) => http.post(ENDPOINTS.PRODUCTS, data),
  update: (id, data) => http.put(ENDPOINTS.PRODUCT(id), data),
  delete: (id) => http.delete(ENDPOINTS.PRODUCT(id)),
  updateStatus: (id, data) => http.post(ENDPOINTS.PRODUCT_STATUS(id), data),
  getBusinessProducts: (businessId, params) => http.get(ENDPOINTS.BUSINESS_PRODUCTS(businessId), { params }),
  getBusinessProductsAdmin: (businessId, params) => http.get(ENDPOINTS.BUSINESS_PRODUCTS_ADMIN(businessId), { params }),
  getRandom: () => http.get(ENDPOINTS.RANDOM_PRODUCTS),
  getDiscounted: (businessId, params) => http.get(ENDPOINTS.BUSINESS_PRODUCTS_DISCOUNT(businessId), { params }),
  getTypes: (businessId) => http.get(ENDPOINTS.BUSINESS_TYPES(businessId)),
  getFiltered: (businessId, params) => http.get(ENDPOINTS.PRODUCTS_FILTERED(businessId), { params }),
  deleteTodayProducts: (businessId) => http.delete(ENDPOINTS.DELETE_PRODUCTS(businessId)),
  updateGroceryBusinessId: (data) => http.post(ENDPOINTS.UPDATE_GROCERY_BUSINESS_ID, data),

  // Restaurant admin
  getRestaurantProducts: (params) => http.get(ENDPOINTS.RESTAURANT_PRODUCTS, { params }),
  addProduct: (data) => http.post(ENDPOINTS.RESTAURANT_ADD_PRODUCT, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateDiscount: (data) => http.post(ENDPOINTS.RESTAURANT_DISCOUNT, data),
  removeDiscount: () => http.get(ENDPOINTS.RESTAURANT_REMOVE_DISCOUNT),
  applyDiscountToProduct: (id, data) => http.post(ENDPOINTS.RESTAURANT_APPLY_DISCOUNT(id), data),
  toggleActive: (id) => http.patch(ENDPOINTS.RESTAURANT_TOGGLE_ACTIVE(id)),
};
