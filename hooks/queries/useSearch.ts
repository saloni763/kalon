import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  searchUsers,
  searchPosts,
  unifiedSearch,
  SearchUser,
  SearchPost,
  SearchUsersResponse,
  SearchPostsResponse,
  UnifiedSearchResponse,
} from '@/services/searchService';

// Query keys - centralized and type-safe
export const searchKeys = {
  all: ['search'] as const,
  users: (query: string, page: number, limit: number) =>
    [...searchKeys.all, 'users', query, page, limit] as const,
  posts: (query: string, page: number, limit: number) =>
    [...searchKeys.all, 'posts', query, page, limit] as const,
  unified: (query: string, type: 'all' | 'users' | 'posts') =>
    [...searchKeys.all, 'unified', query, type] as const,
};

/**
 * Custom hook for debouncing a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to search users
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Results per page (default: 20)
 * @param enabled - Whether the query should run (default: true)
 */
export const useSearchUsers = (
  query: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) => {
  const debouncedQuery = useDebounce(query.trim(), 500);
  const shouldSearch = debouncedQuery.length > 0 && enabled;

  return useQuery<SearchUsersResponse>({
    queryKey: searchKeys.users(debouncedQuery, page, limit),
    queryFn: () => searchUsers(debouncedQuery, page, limit),
    enabled: shouldSearch,
    staleTime: 2 * 60 * 1000, // 2 minutes - search results are fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to search posts
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Results per page (default: 20)
 * @param enabled - Whether the query should run (default: true)
 */
export const useSearchPosts = (
  query: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) => {
  const debouncedQuery = useDebounce(query.trim(), 500);
  const shouldSearch = debouncedQuery.length > 0 && enabled;

  return useQuery<SearchPostsResponse>({
    queryKey: searchKeys.posts(debouncedQuery, page, limit),
    queryFn: () => searchPosts(debouncedQuery, page, limit),
    enabled: shouldSearch,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for unified search (searches both users and posts)
 * @param query - Search query string
 * @param type - Type of search: 'all', 'users', or 'posts' (default: 'all')
 * @param enabled - Whether the query should run (default: true)
 */
export const useUnifiedSearch = (
  query: string,
  type: 'all' | 'users' | 'posts' = 'all',
  enabled: boolean = true
) => {
  const debouncedQuery = useDebounce(query.trim(), 500);
  const shouldSearch = debouncedQuery.length > 0 && enabled;

  return useQuery<UnifiedSearchResponse>({
    queryKey: searchKeys.unified(debouncedQuery, type),
    queryFn: () => unifiedSearch(debouncedQuery, type),
    enabled: shouldSearch,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

