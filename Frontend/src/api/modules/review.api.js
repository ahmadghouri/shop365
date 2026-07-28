import http from "../http";
import { ENDPOINTS } from "../endpoints";

export const reviewApi = {
  getByBusiness: (businessId) => http.get(ENDPOINTS.REVIEWS(businessId)),
  create: (data) => http.post(ENDPOINTS.CREATE_REVIEW, data),

  // Restaurant admin
  getAll: () => http.get(ENDPOINTS.RESTAURANT_REVIEWS),
  reply: (reviewId, data) => http.post(ENDPOINTS.RESTAURANT_REPLY_REVIEW(reviewId), data),
};
