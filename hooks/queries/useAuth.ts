import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  signup, 
  login, 
  updatePersonalInfo, 
  forgotPassword,
  verifyOTP,
  resetPassword,
  SignupData, 
  LoginData, 
  UpdatePersonalInfoData, 
  AuthResponse,
  ForgotPasswordData,
  ForgotPasswordResponse,
  VerifyOTPData,
  VerifyOTPResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  User
} from '@/services/authService';
import { saveToken, saveUser, removeToken } from '@/utils/tokenStorage';
import { googleLogin, GoogleLoginData, logout as logoutApi } from '@/services/authService';
import { signInWithGoogle } from '@/services/googleAuthService';

// Query keys - centralized and type-safe
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
};

// Signup mutation
export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupData) => signup(data),
    onSuccess: async (data) => {
      try {
        // Save token and user data to AsyncStorage
        if (data.token) {
          await saveToken(data.token);
          console.log('Token saved successfully');
        } else {
          console.warn('No token received in signup response');
        }
        await saveUser(data.user);
        console.log('User data saved successfully');
        
        // Cache the user data after successful signup
        queryClient.setQueryData(authKeys.user(), data.user);
      } catch (error) {
        console.error('Error saving auth data:', error);
        // Don't throw - user is still signed up, just storage failed
      }
    },
    onError: (error) => {
      // Log error for debugging (in production, use proper error tracking)
      console.error('Signup error:', error);
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: async (data) => {
      try {
        // Save token and user data to AsyncStorage
        if (data.token) {
          await saveToken(data.token);
          console.log('Token saved successfully');
        } else {
          console.warn('No token received in login response');
        }
        await saveUser(data.user);
        console.log('User data saved successfully');
        
        // Cache the user data after successful login
        queryClient.setQueryData(authKeys.user(), data.user);
      } catch (error) {
        console.error('Error saving auth data:', error);
        // Don't throw - user is still logged in, just storage failed
      }
    },
    onError: (error) => {
      // Log error for debugging
      console.error('Login error:', error);
    },
  });
};

// Update personal info mutation
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePersonalInfoData) => updatePersonalInfo(data),
    onSuccess: async (data) => {
      // Update user data in AsyncStorage
      await saveUser(data.user);
      
      // Update cached user data after successful update
      queryClient.setQueryData(authKeys.user(), data.user);
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      // Log error for debugging
      console.error('Update personal info error:', error);
    },
  });
};

// Get current user from cache (reactive)
export const useUser = () => {
  const queryClient = useQueryClient();
  
  // Use useQuery to reactively subscribe to cache changes
  // When setQueryData is called, this will automatically update
  const query = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // First check cache
      const cached = queryClient.getQueryData<User>(authKeys.user());
      if (cached) {
        return cached;
      }
      
      // If no cached data, try to load from AsyncStorage
      const { getUser } = await import('@/utils/tokenStorage');
      const storedUser = await getUser();
      if (storedUser) {
        queryClient.setQueryData(authKeys.user(), storedUser);
        return storedUser;
      }
      
      return null;
    },
    // Use placeholderData to show cached data immediately while query is "loading"
    placeholderData: () => {
      const cached = queryClient.getQueryData<User>(authKeys.user());
      return cached || undefined;
    },
    staleTime: Infinity, // Never consider stale, only use cache
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  
  return query.data || undefined;
};

// Logout function
export const useLogout = () => {
  const queryClient = useQueryClient();

  return async () => {
    try {
      // Call backend logout endpoint (optional - for logging/analytics)
      try {
        await logoutApi();
        console.log('Backend logout successful');
      } catch (error) {
        // Don't fail logout if backend call fails
        // Token might already be expired or invalid
        console.warn('Backend logout failed (non-critical):', error);
      }

      // Remove token and user data from AsyncStorage
      await removeToken();
      
      // Clear user data from cache
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.removeQueries({ queryKey: authKeys.user() });
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still try to clear local data even if backend call fails
      try {
        await removeToken();
        queryClient.setQueryData(authKeys.user(), null);
        queryClient.removeQueries({ queryKey: authKeys.user() });
      } catch (localError) {
        console.error('Failed to clear local data:', localError);
      }
      throw error;
    }
  };
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => forgotPassword(data),
    onError: (error) => {
      console.error('Forgot password error:', error);
    },
  });
};

// Verify OTP mutation
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: (data: VerifyOTPData) => verifyOTP(data),
    onError: (error) => {
      console.error('Verify OTP error:', error);
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => resetPassword(data),
    onSuccess: () => {
      // Optionally invalidate auth queries after password reset
      // This ensures any cached user data is cleared
    },
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};

// Google login mutation
export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Step 1: Get Google OAuth token
      const googleAuthResult = await signInWithGoogle();
      
      // Step 2: Send to backend
      const loginData: GoogleLoginData = {
        idToken: googleAuthResult.idToken,
        email: googleAuthResult.user.email,
        name: googleAuthResult.user.name,
        picture: googleAuthResult.user.picture,
        googleId: googleAuthResult.user.id,
      };
      
      return await googleLogin(loginData);
    },
    onSuccess: async (data) => {
      try {
        // Save token and user data to AsyncStorage
        if (data.token) {
          await saveToken(data.token);
          console.log('Google login - Token saved successfully');
        } else {
          console.warn('No token received in Google login response');
        }
        await saveUser(data.user);
        console.log('Google login - User data saved successfully');
        
        // Cache the user data after successful login
        queryClient.setQueryData(authKeys.user(), data.user);
      } catch (error) {
        console.error('Error saving Google auth data:', error);
        // Don't throw - user is still logged in, just storage failed
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
    },
  });
};

