import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
});

export const authService = {
  registerUser: async (data) => {
    const response = await apiClient.post('/register', data);
    return response.data;
  },

  loginUser: async (data) => {
    const response = await apiClient.post('/login', data);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.get(`/verify-email?token=${token}`);
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await apiClient.post('/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/reset-password', { token, newPassword });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/get-me');
    return response.data;
  },

  logoutUser: async () => {
    const response = await apiClient.get('/logout');
    return response.data;
  },
  
  getGoogleAuthUrl: () => {
    return '/api/auth/google';
  }
};
