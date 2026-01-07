import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createPost, 
  listPosts,
  CreatePostData, 
  CreatePostResponse,
  ListPostsParams,
  ListPostsResponse
} from '@/services/postService';

// Query keys - centralized and type-safe
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters?: ListPostsParams) => [...postKeys.lists(), filters || {}] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

// List posts query
export const usePosts = (params?: ListPostsParams) => {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => listPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - posts are fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => createPost(data),
    onSuccess: (data) => {
      // Invalidate posts list queries to refetch after creating a new post
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      // Optionally, add the new post to the cache
      // This is useful if you want to show it immediately without refetching
      queryClient.setQueryData(postKeys.detail(data.post.id), data.post);
    },
    onError: (error) => {
      // Log error for debugging
      console.error('Create post error:', error);
    },
  });
};

