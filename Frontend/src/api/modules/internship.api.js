import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const internshipApi = {
  apply: (data) => http.post(ENDPOINTS.INTERNSHIP_APPLY, data),

  // Admin
  getAll: () => http.get(ENDPOINTS.ADMIN_INTERNSHIP_APPS),
};
