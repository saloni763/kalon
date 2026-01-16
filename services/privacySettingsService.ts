import api from '@/lib/api';
import { API_ROUTES } from '@/constants/api';

// Types
export type ProfileVisibilityOption = 'everyone' | 'followers' | 'onlyMe';
export type MessageOption = 'everyone' | 'followers' | 'noOne';

export interface PrivacySettings {
  profileVisibility: ProfileVisibilityOption;
  whoCanMessage: MessageOption;
  locationSharing: boolean;
  onlineStatus: boolean;
}

export interface GetPrivacySettingsResponse {
  message: string;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
}

export interface UpdatePrivacySettingsData {
  profileVisibility?: ProfileVisibilityOption;
  whoCanMessage?: MessageOption;
  locationSharing?: boolean;
  onlineStatus?: boolean;
  blockedUsers?: string[];
}

export interface UpdatePrivacySettingsResponse {
  message: string;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
}

// Get privacy settings API call
export const getPrivacySettings = async (): Promise<GetPrivacySettingsResponse> => {
  try {
    const response = await api.get<GetPrivacySettingsResponse>(
      API_ROUTES.AUTH.GET_PRIVACY_SETTINGS
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch privacy settings';
    throw new Error(errorMessage);
  }
};

// Update privacy settings API call
export const updatePrivacySettings = async (
  data: UpdatePrivacySettingsData
): Promise<UpdatePrivacySettingsResponse> => {
  try {
    const response = await api.put<UpdatePrivacySettingsResponse>(
      API_ROUTES.AUTH.UPDATE_PRIVACY_SETTINGS,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update privacy settings';
    throw new Error(errorMessage);
  }
};

