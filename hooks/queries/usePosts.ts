import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createPost, 
  listPosts,
  toggleLike,
  CreatePostData, 
  CreatePostResponse,
  ListPostsParams,
  ListPostsResponse,
  ToggleLikeResponse
} from '@/services/postService';

// Query keys - centralized and type-safe
// Best practice: Use factory functions for query keys to ensure consistency
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters?: ListPostsParams) => {
    // Normalize filters to ensure consistent cache keys
    const normalizedFilters = filters ? {
      page: filters.page || 1,
      limit: filters.limit || 10,
      userId: filters.userId,
    } : {};
    return [...postKeys.lists(), normalizedFilters] as const;
  },
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
} as const;

// List posts query
// Best practice: Use proper error handling and loading states
export const usePosts = (params?: ListPostsParams) => {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => listPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - posts are fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    // Enable refetch on mount if data is stale
    refetchOnMount: true,
    // Keep previous data while fetching new data (smooth transitions)
    placeholderData: (previousData) => previousData,
  });
};

// Create post mutation
// Best practice: Optimistic updates and proper cache management
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => createPost(data),
    // Optimistic update: Add post to cache immediately
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // Snapshot the previous value for rollback
      const previousPosts = queryClient.getQueriesData<ListPostsResponse>({
        queryKey: postKeys.lists(),
      });

      return { previousPosts };
    },
    onSuccess: (data) => {
      // Update all post lists with the new post at the beginning
      queryClient.setQueriesData<ListPostsResponse>(
        { queryKey: postKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            posts: [data.post, ...oldData.posts],
          };
        }
      );

      // Cache the individual post
      queryClient.setQueryData(postKeys.detail(data.post.id), data.post);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Create post error:', error);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Toggle like mutation
// Best practice: Optimistic updates with rollback on error
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    // Optimistic update: Update UI immediately before server responds
    onMutate: async (postId) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot previous values for rollback
      const previousPostsLists = queryClient.getQueriesData<ListPostsResponse>({
        queryKey: postKeys.lists(),
      });
      const previousPostDetail = queryClient.getQueryData(
        postKeys.detail(postId)
      );

      // Optimistically update all post lists
      queryClient.setQueriesData<ListPostsResponse>(
        { queryKey: postKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post) => {
              if (post.id === postId) {
                const newIsLiked = !post.isLiked;
                return {
                  ...post,
                  likes: newIsLiked ? post.likes + 1 : post.likes - 1,
                  isLiked: newIsLiked,
                };
              }
              return post;
            }),
          };
        }
      );

      // Optimistically update individual post if cached
      queryClient.setQueryData(postKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        const newIsLiked = !oldData.isLiked;
        return {
          ...oldData,
          likes: newIsLiked ? oldData.likes + 1 : oldData.likes - 1,
          isLiked: newIsLiked,
        };
      });

      return { previousPostsLists, previousPostDetail };
    },
    onSuccess: (data, postId) => {
      // Update with server response (ensures consistency)
      queryClient.setQueriesData<ListPostsResponse>(
        { queryKey: postKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post) =>
              post.id === postId
                ? { ...post, likes: data.likes, isLiked: data.isLiked }
                : post
            ),
          };
        }
      );

      // Update individual post cache
      queryClient.setQueryData(postKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, likes: data.likes, isLiked: data.isLiked };
      });
    },
    onError: (error, postId, context) => {
      // Rollback optimistic update on error
      if (context?.previousPostsLists) {
        context.previousPostsLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousPostDetail) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPostDetail);
      }
      console.error('Toggle like error:', error);
    },
    // Retry logic is handled by queryClient default options
  });
};

