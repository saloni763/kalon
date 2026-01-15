import api from '@/lib/api';
import { API_ROUTES } from '@/constants/api';

// Types
export interface CreateEventData {
  eventName: string;
  hostBy: string;
  eventDate: string | Date;
  fromTime: string | Date;
  toTime: string | Date;
  description?: string;
  eventMode: 'Online' | 'Offline';
  selectedCategory: string;
  eventType: 'Public' | 'Private';
  selectedFriends?: string[];
  thumbnailUri?: string | null;
}

export interface Event {
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
  thumbnailUri?: string;
  attendees: number;
  invitedUsers?: Array<{
    _id: string;
    name: string;
    email: string;
    picture?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventResponse {
  message: string;
  event: Event;
}

// Create event API call
export const createEvent = async (data: CreateEventData): Promise<CreateEventResponse> => {
  try {
    const response = await api.post<CreateEventResponse>(
      API_ROUTES.EVENTS.CREATE,
      data
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
    throw new Error(errorMessage);
  }
};

