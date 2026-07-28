import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const prescriptionApi = {
  create: (data) => http.post(ENDPOINTS.PRESCRIPTION, data),
};
