import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  searchUsers,
  searchPosts,
  searchEvents,
  unifiedSearch,
  SearchUser,
  SearchPost,
  SearchEvent,
  SearchUsersResponse,
  SearchPostsResponse,
  SearchEventsResponse,
  UnifiedSearchResponse,
  PostFilterState,
} from '@/services/searchService';
import { FilterState } from '@/components/FilterModal';

// Query keys - centralized and type-safe
export const searchKeys = {
  all: ['search'] as const,
  users: (query: string, page: number, limit: number, filters?: Partial<FilterState>) =>
    [...searchKeys.all, 'users', query, page, limit, filters] as const,
  posts: (query: string, page: number, limit: number, filters?: Partial<PostFilterState>) =>
    [...searchKeys.all, 'posts', query, page, limit, filters] as const,
  events: (query: string, page: number, limit: number, category?: string, eventType?: string, eventMode?: string) =>
    [...searchKeys.all, 'events', query, page, limit, category, eventType, eventMode] as const,
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
 * @param filters - Optional filter parameters
 */
export const useSearchUsers = (
  query: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true,
  filters?: Partial<FilterState>
) => {
  const debouncedQuery = useDebounce(query.trim(), 500);
  const shouldSearch = debouncedQuery.length > 0 && enabled;

  return useQuery<SearchUsersResponse>({
    queryKey: searchKeys.users(debouncedQuery, page, limit, filters),
    queryFn: () => searchUsers(debouncedQuery, page, limit, filters),
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
 * @param filters - Optional post filter parameters
 */
export const useSearchPosts = (
  query: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true,
  filters?: Partial<PostFilterState>
) => {
  const debouncedQuery = useDebounce(query.trim(), 500);
  const shouldSearch = debouncedQuery.length > 0 && enabled;

  return useQuery<SearchPostsResponse>({
    queryKey: searchKeys.posts(debouncedQuery, page, limit, filters),
    queryFn: () => searchPosts(debouncedQuery, page, limit, filters),
    enabled: shouldSearch,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to search events
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Results per page (default: 20)
 * @param enabled - Whether the query should run (default: true)
 * @param category - Optional category filter
 * @param eventType - Optional event type filter
 * @param eventMode - Optional event mode filter
 */
export const useSearchEvents = (
  query: string,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true,
  category?: string,
  eventType?: 'Public' | 'Private',
  eventMode?: 'Online' | 'Offline'
) => {
  const debouncedQuery = useDebounce(query.trim(), 500);
  const shouldSearch = debouncedQuery.length > 0 && enabled;

  return useQuery<SearchEventsResponse>({
    queryKey: searchKeys.events(debouncedQuery, page, limit, category, eventType, eventMode),
    queryFn: () => searchEvents(debouncedQuery, page, limit, category, eventType, eventMode),
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

