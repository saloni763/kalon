import api from '@/lib/api';
import { API_BASE_URL } from '@/constants/api';
import { FilterState } from '@/components/FilterModal';

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
  imageUrl?: string;
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

export interface SearchEvent {
  id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  eventName: string;
  hostBy: string;
  startDateTime: string;
  endDateTime: string;
  description?: string;
  eventMode: 'Online' | 'Offline';
  category: string;
  eventType: 'Public' | 'Private';
  location?: string;
  thumbnailUri?: string;
  attendees: number;
  isJoined?: boolean;
  invitedUsers?: Array<{
    _id: string;
    name: string;
    email: string;
    picture?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchEventsResponse {
  message: string;
  events: SearchEvent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
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
 * Search users by query with optional filters
 */
export const searchUsers = async (
  query: string,
  page: number = 1,
  limit: number = 20,
  filters?: Partial<FilterState>
): Promise<SearchUsersResponse> => {
  try {
    const params: any = {
      q: query,
      page,
      limit,
    };

    // Add filter parameters if provided
    if (filters) {
      if (filters.nationality) params.nationality = filters.nationality;
      if (filters.city) params.city = filters.city;
      if (filters.majorDepartment) params.majorDepartment = filters.majorDepartment;
      if (filters.ageRange) {
        params.ageMin = filters.ageRange.min;
        params.ageMax = filters.ageRange.max;
      }
      if (filters.gender) params.gender = filters.gender;
      if (filters.educationLevel) {
        // Handle both string and array for educationLevel
        if (Array.isArray(filters.educationLevel)) {
          params.educationLevel = filters.educationLevel;
        } else {
          params.educationLevel = filters.educationLevel;
        }
      }
      if (filters.jobOccupation) params.jobOccupation = filters.jobOccupation;
      if (filters.popularInterests && filters.popularInterests.length > 0) {
        params.popularInterests = filters.popularInterests;
      }
      if (filters.creativity && filters.creativity.length > 0) {
        params.creativity = filters.creativity;
      }
      if (filters.sports && filters.sports.length > 0) {
        params.sports = filters.sports;
      }
      if (filters.careerBusiness && filters.careerBusiness.length > 0) {
        params.careerBusiness = filters.careerBusiness;
      }
      if (filters.communityEnvironment && filters.communityEnvironment.length > 0) {
        params.communityEnvironment = filters.communityEnvironment;
      }
      if (filters.healthWellbeing && filters.healthWellbeing.length > 0) {
        params.healthWellbeing = filters.healthWellbeing;
      }
      if (filters.identityLanguage && filters.identityLanguage.length > 0) {
        params.identityLanguage = filters.identityLanguage;
      }
    }

    const response = await api.get<SearchUsersResponse>('/api/search/users', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users');
  }
};

/**
 * Post filter interface
 */
export interface PostFilterState {
  keywords: string;
  postTypes: string[];
  dateFrom: string;
  dateTo: string;
  sortBy: 'mostLiked' | 'mostRecent' | null;
}

/**
 * Search posts by query with optional filters
 */
export const searchPosts = async (
  query: string,
  page: number = 1,
  limit: number = 20,
  filters?: Partial<PostFilterState>
): Promise<SearchPostsResponse> => {
  try {
    const params: any = {
      q: query,
      page,
      limit,
    };

    // Add post filter parameters if provided
    if (filters) {
      if (filters.keywords) params.keywords = filters.keywords;
      if (filters.postTypes && filters.postTypes.length > 0) {
        params.postTypes = filters.postTypes;
      }
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.sortBy) params.sortBy = filters.sortBy;
    }

    const response = await api.get<SearchPostsResponse>('/api/search/posts', {
      params,
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
 * Search events by query with optional filters
 */
export const searchEvents = async (
  query: string,
  page: number = 1,
  limit: number = 20,
  category?: string,
  eventType?: 'Public' | 'Private',
  eventMode?: 'Online' | 'Offline'
): Promise<SearchEventsResponse> => {
  try {
    const params: any = {
      q: query,
      page,
      limit,
    };

    // Add filter parameters if provided
    if (category && category !== 'All Events') {
      params.category = category;
    }
    if (eventType) {
      params.eventType = eventType;
    }
    if (eventMode) {
      params.eventMode = eventMode;
    }

    const response = await api.get<SearchEventsResponse>('/api/search/events', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching events:', error);
    throw new Error(error.message || 'Failed to search events');
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

