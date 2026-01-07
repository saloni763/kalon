import api from '@/lib/api';
import { API_ROUTES } from '@/constants/api';

// Types
export interface CreatePostData {
  content: string;
  replySetting?: 'Anyone' | 'Followers' | 'None';
  pollOptions?: string[];
  pollEndDate?: string;
}

export interface Post {
  id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  content: string;
  replySetting: 'Anyone' | 'Followers' | 'None';
  pollOptions?: string[];
  pollEndDate?: string;
  likes: number;
  replies: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostResponse {
  message: string;
  post: Post;
}

export interface ListPostsParams {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListPostsResponse {
  message: string;
  posts: Post[];
  pagination: PaginationInfo;
}

// Create post API call
export const createPost = async (data: CreatePostData): Promise<CreatePostResponse> => {
  try {
    const response = await api.post<CreatePostResponse>(
      API_ROUTES.POSTS.CREATE,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create post';
    throw new Error(errorMessage);
  }
};

// List posts API call
export const listPosts = async (params?: ListPostsParams): Promise<ListPostsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);

    const queryString = queryParams.toString();
    const url = queryString ? `${API_ROUTES.POSTS.LIST}?${queryString}` : API_ROUTES.POSTS.LIST;

    const response = await api.get<ListPostsResponse>(url);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch posts';
    throw new Error(errorMessage);
  }
};

