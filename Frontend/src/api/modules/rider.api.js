import http from "../http";
import { ENDPOINTS } from "../endpoints";

const multipart = (data) => (data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {});

export const riderApi = {
  getRiders: (params) => http.get(ENDPOINTS.RESTAURANT_RIDERS, { params }),
  createRider: (data) => http.post(ENDPOINTS.RESTAURANT_RIDERS, data, multipart(data)),
  updateRider: (id, data) => http.put(ENDPOINTS.RESTAURANT_RIDER(id), data, multipart(data)),
  toggleRider: (id) => http.patch(ENDPOINTS.RESTAURANT_RIDER_TOGGLE(id)),
  deleteRider: (id) => http.delete(ENDPOINTS.RESTAURANT_RIDER(id)),
};