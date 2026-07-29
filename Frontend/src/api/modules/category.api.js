import http from '../http'

export const categoryApi = {
  getAll: (params = {}) => http.get('/categories', { params }),
  getById: (id) => http.get(`/categories/${id}`),
  create: (data) => http.post('/categories', data),
  update: (id, data) => http.put(`/categories/${id}`, data),
  delete: (id) => http.delete(`/categories/${id}`),
}
