import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  signup, 
  login, 
  getCurrentUser,
  getUserById,
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
  userById: (userId: string) => [...authKeys.all, 'user', userId] as const,
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
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.user() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<User>(authKeys.user());

      // Optimistically update to the new value
      if (previousUser) {
        const optimisticUser: User = {
          ...previousUser,
          ...(newData.fullName && { name: newData.fullName }),
          ...(newData.email && { email: newData.email }),
          ...(newData.dateOfBirth && { dateOfBirth: newData.dateOfBirth }),
          ...(newData.aboutMe && { aboutMe: newData.aboutMe }),
          ...(newData.skills && { skills: newData.skills }),
          ...(newData.educations && { educations: newData.educations }),
          ...(newData.roles && { roles: newData.roles }),
        };
        queryClient.setQueryData(authKeys.user(), optimisticUser);
      }

      // Return a context object with the snapshotted value
      return { previousUser };
    },
    onSuccess: async (data) => {
      // Update user data in AsyncStorage
      await saveUser(data.user);
      
      // Update cached user data with server response
      queryClient.setQueryData(authKeys.user(), data.user);
    },
    onError: (error, _newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.user(), context.previousUser);
      }
      console.error('Update personal info error:', error);
    },
  });
};

// Get current user query
export const useUser = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // First check if we have cached data
      const cached = queryClient.getQueryData<User>(authKeys.user());
      if (cached) {
        // Return cached data immediately, but fetch fresh data in background
        getCurrentUser()
          .then((response) => {
            if (response.user) {
              saveUser(response.user);
              queryClient.setQueryData(authKeys.user(), response.user);
            }
          })
          .catch(() => {
            // Silently fail background refresh
          });
        return cached;
      }

      // If no cached data, try AsyncStorage first
      const { getUser, getToken } = await import('@/utils/tokenStorage');
      const token = await getToken();
      
      if (token) {
        const storedUser = await getUser();
        if (storedUser) {
          // Set cached data from storage
          queryClient.setQueryData(authKeys.user(), storedUser);
        }
        
        // Fetch fresh data from API
        try {
          const response = await getCurrentUser();
          if (response.user) {
            await saveUser(response.user);
            queryClient.setQueryData(authKeys.user(), response.user);
            return response.user;
          }
        } catch (error) {
          // If API fails but we have stored data, return stored data
          if (storedUser) return storedUser;
          throw error;
        }
      }
      
      // No token, return null
      return null;
    },
    placeholderData: () => {
      // Return cached data if available for immediate display
      return queryClient.getQueryData<User>(authKeys.user());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
  
  return query.data;
};

// Get user by ID query
export const useUserById = (userId: string | undefined) => {
  return useQuery({
    queryKey: userId ? authKeys.userById(userId) : ['auth', 'user', 'null'],
    queryFn: async () => {
      if (!userId) return null;
      const response = await getUserById(userId);
      return response.user;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
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

