import axios from 'axios';

// Configure the base URL for your backend API (no trailing slash)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://18.215.117.254:8080';
const WITH_CREDENTIALS = (import.meta.env.VITE_API_WITH_CREDENTIALS ?? 'false') === 'true';

// Shared axios instance for the app
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: WITH_CREDENTIALS,    
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-TOKEN',
});

export default apiClient;

// ===== REQUEST LOGGING INTERCEPTOR =====
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    console.group(`📤 ${config.method.toUpperCase()} ${config.url}`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`📍 Full URL: ${API_BASE_URL}${config.url}`);
    if (config.data) {
      console.log('📦 Payload:', config.data);
    }
    if (config.params) {
      console.log('🔍 Params:', config.params);
    }
    console.groupEnd();

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ===== RESPONSE LOGGING INTERCEPTOR =====
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    console.group(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`📊 Status Code: ${response.status} ${response.statusText}`);
    console.log('📥 Response Data:', response.data);
    console.groupEnd();

    return response;
  },
  (error) => {
    // Log error response
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'unknown';
    const status = error.response?.status || 'no status';

    console.group(`🚨 ${method} ${url} - ${status}`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📥 Response Data:', error.response.data);
      console.error('📋 Headers:', error.response.headers);
    } else if (error.request) {
      console.error('📋 Request:', error.request);
    }
    console.groupEnd();

    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

