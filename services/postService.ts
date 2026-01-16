import api from '@/lib/api';
import { API_ROUTES } from '@/constants/api';

// Types
export interface CreatePostData {
  content: string;
  replySetting?: 'Anyone' | 'Followers' | 'None';
  imageUrl?: string;
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
  imageUrl?: string;
  pollOptions?: string[];
  pollEndDate?: string;
  likes: number;
  replies: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
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

// Toggle like API call
export interface ToggleLikeResponse {
  message: string;
  likes: number;
  isLiked: boolean;
}

export const toggleLike = async (postId: string): Promise<ToggleLikeResponse> => {
  try {
    const response = await api.post<ToggleLikeResponse>(
      API_ROUTES.POSTS.LIKE(postId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle like';
    throw new Error(errorMessage);
  }
};

// Delete post API call
export interface DeletePostResponse {
  message: string;
  postId: string;
}

export const deletePost = async (postId: string): Promise<DeletePostResponse> => {
  try {
    const response = await api.delete<DeletePostResponse>(
      API_ROUTES.POSTS.DELETE(postId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete post';
    throw new Error(errorMessage);
  }
};

// Toggle save post API call
export interface ToggleSavePostResponse {
  message: string;
  isSaved: boolean;
}

export const toggleSavePost = async (postId: string): Promise<ToggleSavePostResponse> => {
  try {
    const response = await api.post<ToggleSavePostResponse>(
      API_ROUTES.POSTS.SAVE(postId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle save post';
    throw new Error(errorMessage);
  }
};

// Get saved posts API call
export const getSavedPosts = async (params?: ListPostsParams): Promise<ListPostsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${API_ROUTES.POSTS.SAVED}?${queryString}` : API_ROUTES.POSTS.SAVED;

    const response = await api.get<ListPostsResponse>(url);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch saved posts';
    throw new Error(errorMessage);
  }
};

