import api from '@/lib/api';
import { API_BASE_URL } from '@/constants/api';

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  location: string;
  skills: string[];
  isVerified: boolean;
  isFollowing: boolean;
}

export interface SearchPost {
  id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  content: string;
  replySetting: 'Anyone' | 'Followers' | 'None';
  likes: number;
  replies: number;
  shares: number;
  isLiked: boolean;
  pollOptions?: string[];
  pollEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchUsersResponse {
  message: string;
  users: SearchUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SearchPostsResponse {
  message: string;
  posts: SearchPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UnifiedSearchResponse {
  message: string;
  results: {
    users: SearchUser[];
    posts: SearchPost[];
  };
}

/**
 * Search users by query
 */
export const searchUsers = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchUsersResponse> => {
  try {
    const response = await api.get<SearchUsersResponse>('/api/search/users', {
      params: {
        q: query,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users');
  }
};

/**
 * Search posts by query
 */
export const searchPosts = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchPostsResponse> => {
  try {
    const response = await api.get<SearchPostsResponse>('/api/search/posts', {
      params: {
        q: query,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching posts:', error);
    throw new Error(error.message || 'Failed to search posts');
  }
};

/**
 * Unified search (searches both users and posts)
 */
export const unifiedSearch = async (
  query: string,
  type: 'all' | 'users' | 'posts' = 'all'
): Promise<UnifiedSearchResponse> => {
  try {
    const response = await api.get<UnifiedSearchResponse>('/api/search', {
      params: {
        q: query,
        type,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error performing unified search:', error);
    throw new Error(error.message || 'Failed to perform search');
  }
};

/**
 * Debounce utility function
 * Delays execution of a function until after a specified wait time
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait) as unknown as NodeJS.Timeout;
  };
}

