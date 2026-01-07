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
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  aboutMe?: string;
  countryCode?: string;
  educations?: EducationEntry[];
  roles?: RoleEntry[];
  skills?: string[];
  goals?: string[];
  networkVisibility?: 'public' | 'friends';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface UpdatePersonalInfoData {
  email: string;
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
