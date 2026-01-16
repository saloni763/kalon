import { Platform } from 'react-native';



declare const __DEV__: boolean;

// These constants are only used in development mode
const PHYSICAL_DEVICE_IP = '192.168.1.2';
const USE_PHYSICAL_DEVICE = true;

const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }

  if (USE_PHYSICAL_DEVICE) {
    return `http://${PHYSICAL_DEVICE_IP}:3000`;
  }

  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000' 
    : 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    GOOGLE_LOGIN: '/api/auth/google-login',
    LOGOUT: '/api/auth/logout',
    GET_CURRENT_USER: '/api/auth/me',
    GET_USER_BY_ID: (userId: string) => `/api/auth/user/${userId}`,
    UPDATE_PERSONAL_INFO: '/api/auth/update-personal-info',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    REQUEST_OTP: '/api/auth/request-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    FOLLOW_USER: (userId: string) => `/api/auth/user/${userId}/follow`,
    UNFOLLOW_USER: (userId: string) => `/api/auth/user/${userId}/unfollow`,
    GET_FOLLOWERS: (userId: string) => `/api/auth/user/${userId}/followers`,
    GET_FOLLOWING: (userId: string) => `/api/auth/user/${userId}/following`,
    GET_PRIVACY_SETTINGS: '/api/auth/privacy-settings',
    UPDATE_PRIVACY_SETTINGS: '/api/auth/privacy-settings',
  },
  POSTS: {
    CREATE: '/api/posts/create',
    LIST: '/api/posts',
    LIKE: (postId: string) => `/api/posts/${postId}/like`,
    DELETE: (postId: string) => `/api/posts/${postId}`,
  },
  SEARCH: {
    USERS: '/api/search/users',
    POSTS: '/api/search/posts',
    UNIFIED: '/api/search',
  },
  EVENTS: {
    CREATE: '/api/events/create',
    LIST: '/api/events',
    GET_BY_ID: (eventId: string) => `/api/events/${eventId}`,
  },
  UPLOAD: {
    IMAGE: '/api/upload/image',
  },
  LOCATION: {
    UPDATE: '/api/auth/update-location',
  },
} as const;
