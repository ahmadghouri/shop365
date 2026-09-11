import http from "../http";
import { ENDPOINTS } from "../endpoints";

export default {
  createRider: (data) => http.post(ENDPOINTS.RESTAURANT_RIDERS, data),
  getRiders: () => http.get(ENDPOINTS.RESTAURANT_RIDERS),
  getRider: (id) => http.get(ENDPOINTS.RESTAURANT_RIDER(id)),
  deleteRider: (id) => http.delete(ENDPOINTS.RESTAURANT_RIDER(id)),
};
