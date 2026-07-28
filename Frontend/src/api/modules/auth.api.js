import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const authApi = {
  login: (data) => http.post(ENDPOINTS.LOGIN, data),
  register: (data) => http.post(ENDPOINTS.REGISTER, data),
  updatePassword: (data) => http.post(ENDPOINTS.UPDATE_PASSWORD, data),
  addDetails: (data) => http.post(ENDPOINTS.ADD_DETAILS, data),
  profile: () => http.get(ENDPOINTS.PROFILE),
  refreshUser: () => http.get(ENDPOINTS.REFRESH_USER),
};
