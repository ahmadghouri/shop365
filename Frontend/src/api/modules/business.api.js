import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const businessApi = {
  getAll: () => http.get(ENDPOINTS.BUSINESSES),
  getById: (id) => http.get(ENDPOINTS.BUSINESS(id)),
  create: (data) => http.post(ENDPOINTS.BUSINESSES, data),
  createProvider: async (data) => {
    const { phone_no, email, password, ...businessData } = data;
    const businessResponse = await http.post(ENDPOINTS.BUSINESSES, businessData);
    const business = businessResponse.data.data;
    const businessId = business.id || business._id;

    try {
      await http.post(ENDPOINTS.ADMIN_CREATE_ADMIN, {
        name: business.name,
        phone_no,
        email,
        password,
        business: business.name,
        business_id: businessId,
      });
      return businessResponse;
    } catch (error) {
      if (businessId) {
        await http.delete(ENDPOINTS.BUSINESS(businessId)).catch(() => {});
      }
      throw error;
    }
  },
  update: (id, data) => http.put(ENDPOINTS.BUSINESS(id), data),
  delete: (id) => http.delete(ENDPOINTS.BUSINESS(id)),
  getSubBusinesses: (id) => http.get(ENDPOINTS.SUB_BUSINESSES(id)),
  getNumber: (id) => http.get(ENDPOINTS.BUSINESS_NUMBER(id)),
  getStats: (params) => http.get(ENDPOINTS.ADMIN_BUSINESS_STATS, { params }),
  getOwn: () => http.get(ENDPOINTS.RESTAURANT_BUSINESS),
  updateOwn: (data) => http.put(ENDPOINTS.RESTAURANT_BUSINESS, data),
};
