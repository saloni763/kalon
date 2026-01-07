import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { getToken, removeToken } from '@/utils/tokenStorage';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from storage and add to request headers
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 401) {
        // Token is invalid or expired, remove it from storage
        await removeToken();
        const message = data?.message || data?.error || 'Invalid credentials';
        return Promise.reject(new Error(message));
      } else if (status === 409) {
        const message = data?.message || data?.error || 'User already exists';
        return Promise.reject(new Error(message));
      } else if (status === 400) {
        // Show detailed validation errors if available
        if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
          const errorMessages = data.details.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join('\n');
          return Promise.reject(new Error(errorMessages));
        }
        const message = data?.message || data?.error || 'Invalid input data';
        return Promise.reject(new Error(message));
      } else if (status === 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
    } else if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
    }

    return Promise.reject(error);
  }
);

export default api;
