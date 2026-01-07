import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry once for network errors or 5xx errors
        return failureCount < 1;
      },
      refetchOnWindowFocus: false, // Disable refetch on window focus for mobile
      refetchOnReconnect: true, // Refetch when network reconnects
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection (formerly cacheTime)
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry once for network errors or 5xx errors
        return failureCount < 1;
      },
    },
  },
});

