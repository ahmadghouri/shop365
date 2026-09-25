import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const riderApplicationApi = {
  // Admin
  getAll: () => http.get(ENDPOINTS.ADMIN_RIDER_APPS),
  getOne: (id) => http.get(ENDPOINTS.ADMIN_RIDER_APP(id)),
  updateStatus: (id, status) =>
    http.put(ENDPOINTS.ADMIN_RIDER_APP_STATUS(id), { status }),
  updateDocument: (id, doc, status, note) =>
    http.put(ENDPOINTS.ADMIN_RIDER_APP_DOCUMENT(id), { doc, status, note }),
  updateMessage: (id, admin_message) =>
    http.put(ENDPOINTS.ADMIN_RIDER_APP_MESSAGE(id), { admin_message }),
};
