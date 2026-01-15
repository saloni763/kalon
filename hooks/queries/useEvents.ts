import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createEvent, 
  listEvents,
  getEventById,
  CreateEventData, 
  CreateEventResponse,
  ListEventsParams,
  ListEventsResponse,
  GetEventResponse
} from '@/services/eventService';

// Query keys - centralized and type-safe
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: ListEventsParams) => {
    // Normalize filters to ensure consistent cache keys
    const normalizedFilters = filters ? {
      page: filters.page || 1,
      limit: filters.limit || 10,
      userId: filters.userId,
      category: filters.category,
      eventType: filters.eventType,
      eventMode: filters.eventMode,
    } : {};
    return [...eventKeys.lists(), normalizedFilters] as const;
  },
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
} as const;

// List events query
// Best practice: Use proper error handling, loading states, and cache management
export const useEvents = (params?: ListEventsParams) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => listEvents(params),
    enabled: params !== undefined, // Only fetch if params are provided
    staleTime: 2 * 60 * 1000, // 2 minutes - events are fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    // Enable refetch on mount if data is stale
    refetchOnMount: true,
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: false, // Disable to prevent excessive refetches
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Keep previous data while fetching new data (smooth transitions)
    placeholderData: (previousData) => previousData,
    // Retry configuration
    retry: 1, // Retry once on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Get event by ID query
// Best practice: Proper error handling and cache management
export const useEvent = (eventId: string | undefined) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: eventKeys.detail(eventId || ''),
    queryFn: () => getEventById(eventId!),
    enabled: !!eventId, // Only fetch if eventId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Disable to prevent excessive refetches
    refetchOnReconnect: true,
    // Keep previous data while fetching new data (smooth transitions)
    placeholderData: (previousData) => {
      // Try to get from cache first
      const cached = queryClient.getQueryData<GetEventResponse>(eventKeys.detail(eventId || ''));
      return cached || previousData;
    },
    // Retry configuration
    retry: 1, // Retry once on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Create event mutation
// Best practice: Optimistic updates and proper cache management
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    // Optimistic update: Add event to cache immediately
    onMutate: async (newEvent) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });

      // Snapshot the previous value for rollback
      const previousEventsLists = queryClient.getQueriesData<ListEventsResponse>({
        queryKey: eventKeys.lists(),
      });

      return { previousEventsLists };
    },
    onSuccess: (data) => {
      // Cache the individual event detail
      queryClient.setQueryData(eventKeys.detail(data.event.id), {
        message: 'Event retrieved successfully',
        event: data.event,
      });

      // Update all event lists with the new event at the beginning
      queryClient.setQueriesData<ListEventsResponse>(
        { queryKey: eventKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            events: [data.event, ...oldData.events],
            pagination: {
              ...oldData.pagination,
              totalEvents: oldData.pagination.totalEvents + 1,
            },
          };
        }
      );

      // Invalidate to ensure consistency (refetch in background)
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousEventsLists) {
        context.previousEventsLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Create event error:', error);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

