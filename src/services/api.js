import axios from 'axios';
import { getToken } from './tokenService';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'https://book-vault-v6e5.onrender.com/api',
// });
 const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
});
// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors
      console.error('Unauthorized request - redirecting to login');
    }
    return Promise.reject(error);
  }
);

// Named export
export { api };

// Default export
export default api;