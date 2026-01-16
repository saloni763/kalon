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
  location?: string;
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
  location?: string;
  thumbnailUri?: string;
  attendees: number;
  isJoined?: boolean;
  isSaved?: boolean;
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

export interface ListEventsParams {
  page?: number;
  limit?: number;
  userId?: string;
  category?: string;
  eventType?: 'Public' | 'Private';
  eventMode?: 'Online' | 'Offline';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListEventsResponse {
  message: string;
  events: Event[];
  pagination: PaginationInfo;
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

// List events API call
export const listEvents = async (params?: ListEventsParams): Promise<ListEventsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.eventMode) queryParams.append('eventMode', params.eventMode);

    const queryString = queryParams.toString();
    const url = queryString ? `${API_ROUTES.EVENTS.LIST}?${queryString}` : API_ROUTES.EVENTS.LIST;

    const response = await api.get<ListEventsResponse>(url);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch events';
    throw new Error(errorMessage);
  }
};

// Get event by ID API call
export interface GetEventResponse {
  message: string;
  event: Event & {
    isJoined?: boolean;
    isPastEvent?: boolean;
    memberAvatars?: string[];
  };
}

export const getEventById = async (eventId: string): Promise<GetEventResponse> => {
  try {
    const response = await api.get<GetEventResponse>(
      API_ROUTES.EVENTS.GET_BY_ID(eventId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch event';
    throw new Error(errorMessage);
  }
};

// Toggle save event API call
export interface ToggleSaveEventResponse {
  message: string;
  isSaved: boolean;
}

export const toggleSaveEvent = async (eventId: string): Promise<ToggleSaveEventResponse> => {
  try {
    const response = await api.post<ToggleSaveEventResponse>(
      API_ROUTES.EVENTS.SAVE(eventId)
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle save event';
    throw new Error(errorMessage);
  }
};

// Get saved events API call
export const getSavedEvents = async (params?: ListEventsParams): Promise<ListEventsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${API_ROUTES.EVENTS.SAVED}?${queryString}` : API_ROUTES.EVENTS.SAVED;

    const response = await api.get<ListEventsResponse>(url);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch saved events';
    throw new Error(errorMessage);
  }
};

