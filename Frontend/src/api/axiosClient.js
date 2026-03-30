import axios from 'axios';

/**
 * Pre-configured Axios instance for all API calls.
 *
 * - baseURL is read from the VITE_API_URL environment variable
 *   (injected at build time by Vite).
 * - If a JWT token exists in localStorage, it is automatically
 *   attached as a Bearer token in the Authorization header.
 * - On 401 responses, localStorage is cleared and the browser
 *   is redirected to /login.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — attaches the JWT token from localStorage
 * to every outgoing request if one is available.
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — on 401 (Unauthorized):
 *   1. Clears the stored JWT token.
 *   2. Redirects the browser to /login (unless already there).
 *
 * This handles expired tokens and revoked sessions globally,
 * so individual components don't need to duplicate the logic.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');

      // Only redirect if we're not already on the login page
      // (prevents infinite redirect loops)
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
