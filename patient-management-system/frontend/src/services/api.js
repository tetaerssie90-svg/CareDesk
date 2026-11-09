import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('care_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('care_token');
      localStorage.removeItem('care_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const errorMessage = (error) => error.response?.data?.message || 'Something went wrong. Please try again.';
export default api;
