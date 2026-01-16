import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPrivacySettings,
  updatePrivacySettings,
  UpdatePrivacySettingsData,
  GetPrivacySettingsResponse,
  UpdatePrivacySettingsResponse,
  PrivacySettings,
} from '@/services/privacySettingsService';

// Query keys - centralized and type-safe
export const privacySettingsKeys = {
  all: ['privacySettings'] as const,
  settings: () => [...privacySettingsKeys.all, 'settings'] as const,
};

// Default privacy settings
const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'everyone',
  whoCanMessage: 'everyone',
  locationSharing: false,
  onlineStatus: false,
};

// Get privacy settings query
export const usePrivacySettings = () => {
  return useQuery({
    queryKey: privacySettingsKeys.settings(),
    queryFn: async () => {
      const response = await getPrivacySettings();
      return {
        privacySettings: response.privacySettings || defaultPrivacySettings,
        blockedUsers: response.blockedUsers || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    retry: 1,
    refetchOnMount: true,
    placeholderData: () => {
      // Return default values for immediate display while loading
      return {
        privacySettings: defaultPrivacySettings,
        blockedUsers: [],
      };
    },
  });
};

// Update privacy settings mutation
export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePrivacySettingsData) => updatePrivacySettings(data),
    // Optimistic update: Update UI immediately before server responds
    onMutate: async (newData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: privacySettingsKeys.settings() });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData<{
        privacySettings: PrivacySettings;
        blockedUsers: string[];
      }>(privacySettingsKeys.settings());

      // Optimistically update to the new value
      if (previousData) {
        const optimisticData = {
          privacySettings: {
            ...previousData.privacySettings,
            ...(newData.profileVisibility !== undefined && {
              profileVisibility: newData.profileVisibility,
            }),
            ...(newData.whoCanMessage !== undefined && {
              whoCanMessage: newData.whoCanMessage,
            }),
            ...(newData.locationSharing !== undefined && {
              locationSharing: newData.locationSharing,
            }),
            ...(newData.onlineStatus !== undefined && {
              onlineStatus: newData.onlineStatus,
            }),
          },
          blockedUsers:
            newData.blockedUsers !== undefined
              ? newData.blockedUsers
              : previousData.blockedUsers,
        };
        queryClient.setQueryData(privacySettingsKeys.settings(), optimisticData);
      }

      // Return context object with the snapshotted value
      return { previousData };
    },
    onSuccess: (data) => {
      // Update cache with server response (ensures consistency)
      queryClient.setQueryData(privacySettingsKeys.settings(), {
        privacySettings: data.privacySettings,
        blockedUsers: data.blockedUsers,
      });
    },
    onError: (error, _newData, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(privacySettingsKeys.settings(), context.previousData);
      }
      console.error('Update privacy settings error:', error);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: privacySettingsKeys.settings() });
    },
  });
};

