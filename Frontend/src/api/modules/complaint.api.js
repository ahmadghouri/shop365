import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const complaintApi = {
  create: (data) => http.post(ENDPOINTS.COMPLAINTS, data),

  // Restaurant admin
  getAll: () => http.get(ENDPOINTS.RESTAURANT_COMPLAINTS),
  updateStatus: (data) => http.put(ENDPOINTS.RESTAURANT_COMPLAINT_STATUS, data),
};
