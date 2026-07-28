import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const uploadApi = {
  image: (formData) =>
    http.post(ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  images: (formData) =>
    http.post(ENDPOINTS.UPLOAD_IMAGES, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
