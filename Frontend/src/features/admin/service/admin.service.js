import axios from 'axios';
import { API_BASE_URL, attachAuthToken } from '../../../lib/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  withCredentials: true,
});

// Use the standard token attacher from lib/api
api.interceptors.request.use(attachAuthToken);

export const adminService = {
  getStats:    () => api.get('/stats').then(r => r.data),
  getLogs:     () => api.get('/logs').then(r => r.data),
  getAllUsers: () => api.get('/users').then(r => r.data),
  updateRole:  (id, role) => api.patch(`/users/${id}/role`, { role }).then(r => r.data),
  deleteUser:  (id) => api.delete(`/users/${id}`).then(r => r.data),
  assignTask:  (data) => api.post('/tasks/assign', data).then(r => r.data),
};
