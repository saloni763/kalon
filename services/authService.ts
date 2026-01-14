import api from '@/lib/api';
import { API_ROUTES } from '@/constants/api';

// Types
export interface SignupData {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  // Optional personal info fields
  countryCode?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  aboutMe?: string;
  educations?: EducationEntry[];
  roles?: RoleEntry[];
  skills?: string[];
  goals?: string[];
  networkVisibility?: 'public' | 'friends';
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
}

export interface EducationEntry {
  schoolUniversity: string;
  degreeProgram: string;
  startYear: string;
  currentlyEnrolled: boolean;
  endYear?: string;
  grade?: string;
}

export interface RoleEntry {
  currentRole: string;
  companyOrganisation: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  location?: string;
}

export interface User {
  id: string;
  name: string;
  mobileNumber: string;
  email: string;
  picture?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  aboutMe?: string;
  countryCode?: string;
  educations?: EducationEntry[];
  roles?: RoleEntry[];
  skills?: string[];
  goals?: string[];
  networkVisibility?: 'public' | 'friends';
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface UpdatePersonalInfoData {
  email?: string;
  fullName?: string;
  mobileNumber?: string;
  countryCode?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  aboutMe?: string;
  educations?: EducationEntry[];
  roles?: RoleEntry[];
  skills?: string[];
  goals?: string[];
  networkVisibility?: 'public' | 'friends';
}

// Signup API call
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      API_ROUTES.AUTH.SIGNUP,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Login API call
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      API_ROUTES.AUTH.LOGIN,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to login');
  }
};

// Get current user profile API call
export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const response = await api.get<AuthResponse>(
      API_ROUTES.AUTH.GET_CURRENT_USER
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user profile');
  }
};

// Get user profile by ID API call
export const getUserById = async (userId: string): Promise<AuthResponse> => {
  try {
    const response = await api.get<AuthResponse>(
      API_ROUTES.AUTH.GET_USER_BY_ID(userId)
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user profile');
  }
};

// Update personal info API call
export const updatePersonalInfo = async (data: UpdatePersonalInfoData): Promise<AuthResponse> => {
  try {
    const response = await api.put<AuthResponse>(
      API_ROUTES.AUTH.UPDATE_PERSONAL_INFO,
      data
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update personal information');
  }
};

// Password recovery interfaces
export interface ForgotPasswordData {
  emailOrPhone: string;
}

export interface ForgotPasswordResponse {
  message: string;
  otp?: string; // Only in development mode
}

export interface RequestOTPData {
  emailOrPhone: string;
  purpose?: 'password-reset' | 'email-verification';
}

export interface RequestOTPResponse {
  message: string;
  otp?: string; // Only in development mode
}

export interface VerifyOTPData {
  emailOrPhone: string;
  otp: string;
  purpose?: 'password-reset' | 'email-verification';
}

export interface VerifyOTPResponse {
  message: string;
}

export interface ResetPasswordData {
  emailOrPhone: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Forgot password API call
export const forgotPassword = async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
    throw new Error(errorMessage);
  }
};

// Request OTP API call (for email verification during signup)
export const requestOTP = async (data: RequestOTPData): Promise<RequestOTPResponse> => {
  try {
    const response = await api.post<RequestOTPResponse>(
      API_ROUTES.AUTH.REQUEST_OTP,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to request OTP';
    throw new Error(errorMessage);
  }
};

// Verify OTP API call
export const verifyOTP = async (data: VerifyOTPData): Promise<VerifyOTPResponse> => {
  try {
    const response = await api.post<VerifyOTPResponse>(
      API_ROUTES.AUTH.VERIFY_OTP,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
    throw new Error(errorMessage);
  }
};

// Reset password API call
export const resetPassword = async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>(
      API_ROUTES.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
    throw new Error(errorMessage);
  }
};

// Google OAuth login data
export interface GoogleLoginData {
  idToken: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

// Google login API call
export const googleLogin = async (data: GoogleLoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      API_ROUTES.AUTH.GOOGLE_LOGIN,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to login with Google';
    throw new Error(errorMessage);
  }
};

// Logout response interface
export interface LogoutResponse {
  message: string;
}

// Logout API call
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await api.post<LogoutResponse>(
      API_ROUTES.AUTH.LOGOUT
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to logout';
    throw new Error(errorMessage);
  }
};

// Follow/Unfollow interfaces
export interface FollowUserResponse {
  message: string;
  following: boolean;
}

export interface UnfollowUserResponse {
  message: string;
  following: boolean;
}

// Follow user API call
export const followUser = async (userId: string): Promise<FollowUserResponse> => {
  try {
    const response = await api.post<FollowUserResponse>(
      API_ROUTES.AUTH.FOLLOW_USER(userId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to follow user';
    throw new Error(errorMessage);
  }
};

// Unfollow user API call
export const unfollowUser = async (userId: string): Promise<UnfollowUserResponse> => {
  try {
    const response = await api.post<UnfollowUserResponse>(
      API_ROUTES.AUTH.UNFOLLOW_USER(userId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to unfollow user';
    throw new Error(errorMessage);
  }
};

// Get followers list
export interface GetFollowersResponse {
  message: string;
  followers: User[];
}

// Get following list
export interface GetFollowingResponse {
  message: string;
  following: User[];
}

// Get followers API call
export const getFollowers = async (userId: string): Promise<GetFollowersResponse> => {
  try {
    const response = await api.get<GetFollowersResponse>(
      API_ROUTES.AUTH.GET_FOLLOWERS(userId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get followers';
    throw new Error(errorMessage);
  }
};

// Get following API call
export const getFollowing = async (userId: string): Promise<GetFollowingResponse> => {
  try {
    const response = await api.get<GetFollowingResponse>(
      API_ROUTES.AUTH.GET_FOLLOWING(userId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get following';
    throw new Error(errorMessage);
  }
};
