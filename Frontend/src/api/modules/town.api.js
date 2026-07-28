import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const townApi = {
  getAll: () => http.get(ENDPOINTS.TOWNS),
  getTowns: () => http.get(ENDPOINTS.GET_TOWNS),
  getById: (id) => http.get(ENDPOINTS.TOWN(id)),
  create: (data) => http.post(ENDPOINTS.TOWNS, data),
  update: (id, data) => http.put(ENDPOINTS.TOWN(id), data),
  delete: (id) => http.delete(ENDPOINTS.TOWN(id)),
};
