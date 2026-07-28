import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const headerImageApi = {
  getAll: () => http.get(ENDPOINTS.HEADER_IMAGES),
  getById: (id) => http.get(ENDPOINTS.HEADER_IMAGE(id)),
  create: (data) => http.post(ENDPOINTS.HEADER_IMAGES, data),
  update: (id, data) => http.put(ENDPOINTS.HEADER_IMAGE(id), data),
  delete: (id) => http.delete(ENDPOINTS.HEADER_IMAGE(id)),
  reorder: (data) => http.post(ENDPOINTS.HEADER_IMAGES_REORDER, data),
};
