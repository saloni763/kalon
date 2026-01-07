import { getToken, getUser } from './tokenStorage';
import { queryClient } from '@/lib/queryClient';
import { authKeys } from '@/hooks/queries/useAuth';
import type { User } from '@/services/authService';

/**
 * Check if user has a valid token and restore session
 * This should be called on app startup
 */
export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  try {
    const token = await getToken();
    const user = await getUser();

    if (token && user) {
      // Restore user data to React Query cache
      queryClient.setQueryData(authKeys.user(), user);
      return { isAuthenticated: true, user };
    }

    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false, user: null };
  }
};

