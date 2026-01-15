import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createEvent, 
  CreateEventData, 
  CreateEventResponse
} from '@/services/eventService';

// Query keys - centralized and type-safe
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: any) => {
    const normalizedFilters = filters || {};
    return [...eventKeys.lists(), normalizedFilters] as const;
  },
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
} as const;

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    onSuccess: (data) => {
      // Cache the individual event
      queryClient.setQueryData(eventKeys.detail(data.event.id), data.event);
      
      // Invalidate event lists to refetch with new event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: (error) => {
      console.error('Create event error:', error);
    },
  });
};

