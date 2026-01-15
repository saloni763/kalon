import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchIcon from '@/components/ui/SearchIcon';
import BackArrowIcon from '@/components/BackArrowIcon';
import Event, { EventType } from '@/components/Event-card';
import { EventFilters } from './filter';
import { useEvents } from '@/hooks/queries/useEvents';
import { Event as BackendEvent } from '@/services/eventService';
import { useUser } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';

const FILTERS_STORAGE_KEY = '@kalon_event_filters';

const categories = ['All Events', 'Music', 'Sports', 'Community'];

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Helper function to format time range
const formatTimeRange = (startDateTime: string, endDateTime: string): string => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  
  const startTime = start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const endTime = end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${startTime} – ${endTime}`;
};

// Map backend event to frontend EventType
const mapEventToEventType = (event: BackendEvent, currentUserId?: string): EventType => {
  return {
    id: event.id,
    title: event.eventName,
    host: event.hostBy,
    date: formatDate(event.startDateTime),
    time: formatTimeRange(event.startDateTime, event.endDateTime),
    location: event.eventMode === 'Offline' ? event.location : undefined,
    imageUri: event.thumbnailUri,
    joinedCount: event.attendees,
    isOnline: event.eventMode === 'Online',
    isPublic: event.eventType === 'Public',
    isJoined: event.isJoined || false,
  };
};

const DEFAULT_FILTERS: EventFilters = {
  date: 'starting-soon',
  eventType: {
    private: true,
    public: true,
  },
  eventMode: 'all',
};

export default function EventsScreen() {
  const router = useRouter();
  const user = useUser();
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [isExploreAllMode, setIsExploreAllMode] = useState(false);
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);

  // Build query params for user's own events
  const myEventsParams = useMemo(() => {
    if (!user.data?.id) return undefined;
    return {
      page: 1,
      limit: 10, // Limit to show a few events in "My Events" section
      userId: user.data.id,
    };
  }, [user.data?.id]);

  // Build query params from filters for discover events
  const queryParams = useMemo(() => {
    const params: any = {
      page: 1,
      limit: 50,
    };

    // Category filter
    if (selectedCategory && selectedCategory !== 'All Events') {
      params.category = selectedCategory;
    }

    // Event type filter
    if (!filters.eventType.private && filters.eventType.public) {
      params.eventType = 'Public';
    } else if (filters.eventType.private && !filters.eventType.public) {
      params.eventType = 'Private';
    }
    // If both are selected, don't filter by type

    // Event mode filter
    if (filters.eventMode === 'online') {
      params.eventMode = 'Online';
    } else if (filters.eventMode === 'onsite') {
      params.eventMode = 'Offline';
    }
    // If 'all', don't filter by mode

    return params;
  }, [selectedCategory, filters]);

  // Fetch user's own events
  // Only fetch if user is logged in and params are defined
  const { 
    data: myEventsData, 
    isLoading: isLoadingMyEvents, 
    error: myEventsError, 
    refetch: refetchMyEvents,
    isRefetching: isRefetchingMyEvents 
  } = useEvents(myEventsParams);

  // Fetch discover events using React Query
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useEvents(queryParams);

  // Load filters from AsyncStorage when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadFilters = async () => {
        try {
          const storedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
          if (storedFilters) {
            const parsedFilters = JSON.parse(storedFilters);
            setFilters({ ...DEFAULT_FILTERS, ...parsedFilters });
          }
        } catch (error) {
          console.error('Error loading filters:', error);
        }
      };
      loadFilters();
    }, [])
  );

  // Check if any filters are active (different from default)
  const hasActiveFilters = () => {
    return (
      filters.date !== DEFAULT_FILTERS.date ||
      filters.eventType.private !== DEFAULT_FILTERS.eventType.private ||
      filters.eventType.public !== DEFAULT_FILTERS.eventType.public ||
      filters.eventMode !== DEFAULT_FILTERS.eventMode
    );
  };

  // Map backend events to frontend EventType format
  const mappedMyEvents = useMemo(() => {
    if (!myEventsData?.events) return [];
    return myEventsData.events.map(event => mapEventToEventType(event, user.data?.id));
  }, [myEventsData?.events, user.data?.id]);

  const mappedEvents = useMemo(() => {
    if (!data?.events) return [];
    return data.events.map(event => mapEventToEventType(event, user.data?.id));
  }, [data?.events, user.data?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchMyEvents(), refetch()]);
    } catch (error) {
      showToast.error('Failed to refresh events');
    }
  };

  const handleJoin = (eventId: string) => {
    console.log('Join event:', eventId);
  };

  const handleShare = (eventId: string) => {
    console.log('Share event:', eventId);
  };

  const handleSave = (eventId: string) => {
    console.log('Save event:', eventId);
  };

  const handleExploreAll = () => {
    setIsExploreAllMode(true);
  };

  const handleBack = () => {
    setIsExploreAllMode(false);
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search events');
  };

  const handleFilter = () => {
    // Navigate to filter screen with current filters
    const filtersParam = encodeURIComponent(JSON.stringify(filters));
    router.push(`/events/filter?filters=${filtersParam}` as any);
  };

  // If in explore all mode, show the full events list
  if (isExploreAllMode) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content} edges={['top']}>
          {/* Explore Events Header */}
          <View style={styles.exploreHeader}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <BackArrowIcon width={24} height={24} color="#0D0A1B" />
            </TouchableOpacity>
            <Text style={styles.exploreTitle}>Explore Events</Text>
            <View style={styles.headerRightIcons}>
              <TouchableOpacity 
                style={styles.headerIconButton} 
                onPress={handleSearch}
                activeOpacity={0.7}
              >
                <SearchIcon width={20} height={20} color="#AF7DFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIconButton} 
                onPress={handleFilter}
                activeOpacity={0.7}
              >
                <Ionicons name="options-outline" size={20} color="#AF7DFF" />
                {hasActiveFilters() && (
                  <View style={styles.filterIndicator} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
              />
            }
          >
            {/* Category Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#AF7DFF" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {error instanceof Error ? error.message : 'Failed to load events'}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => refetch()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Event Cards */}
            {!isLoading && !error && (
              <View style={styles.eventsList}>
                {mappedEvents.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No events found</Text>
                    <Text style={styles.emptySubtext}>
                      Try adjusting your filters or create a new event
                    </Text>
                  </View>
                ) : (
                  mappedEvents.map((event) => (
                    <Event
                      key={event.id}
                      event={event}
                      onJoin={handleJoin}
                      onShare={handleShare}
                      onSave={handleSave}
                    />
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Default view with empty state and discover section
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity 
              style={styles.searchButton} 
              activeOpacity={0.7}
              onPress={handleSearch}
            >
              <View style={styles.searchIconContainer}>
                <SearchIcon width={20} height={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton} 
              activeOpacity={0.7}
              onPress={() => router.push('/events/create' as any)}
            >
              <View style={styles.addIconContainer}>
                <Ionicons name="add" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching || isRefetchingMyEvents}
                onRefresh={handleRefresh}
              />
            }
          >
            {/* Loading State */}
            {(isLoading || isLoadingMyEvents) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#AF7DFF" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            )}

            {/* Error State */}
            {(error || myEventsError) && !isLoading && !isLoadingMyEvents && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {error instanceof Error ? error.message : myEventsError instanceof Error ? myEventsError.message : 'Failed to load events'}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    refetch();
                    refetchMyEvents();
                  }}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* My Events Section - Show only if user has created events */}
            {!isLoadingMyEvents && !myEventsError && mappedMyEvents.length > 0 && (
              <View style={styles.myEventsSection}>
                <View style={styles.myEventsHeader}>
                  <Text style={styles.myEventsTitle}>My Events</Text>
                  <TouchableOpacity 
                    onPress={handleExploreAll}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.exploreAllText}>Explore All</Text>
                  </TouchableOpacity>
                </View>

                {/* My Event Cards */}
                <View style={styles.eventsList}>
                  {mappedMyEvents.map((event) => (
                    <Event
                      key={event.id}
                      event={event}
                      onJoin={handleJoin}
                      onShare={handleShare}
                      onSave={handleSave}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Don't have any Events yet Section - Show only if no events created and not loading */}
            {!isLoadingMyEvents && !myEventsError && mappedMyEvents.length === 0 && !isLoading && !error && mappedEvents.length === 0 && (
              <View style={styles.emptyStateSection}>
                <Text style={styles.emptyStateTitle}>Don't have any Events yet</Text>
                <Text style={styles.emptyStateDescription}>
                  Create your own event and invite your friends or the community.
                </Text>
                <TouchableOpacity 
                  style={styles.createEventButton} 
                  activeOpacity={0.8}
                  onPress={() => router.push('/events/create' as any)}
                >
                  <Text style={styles.createEventButtonText}>Create Event</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Discover Events Section */}
            {!isLoading && !error && (
              <View style={styles.discoverSection}>
                <View style={styles.discoverHeader}>
                  <Text style={styles.discoverTitle}>Discover Events</Text>
                  <TouchableOpacity 
                    onPress={handleExploreAll}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.exploreAllText}>Explore All</Text>
                  </TouchableOpacity>
                </View>

                {/* Category Filters */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryContainer}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category && styles.categoryButtonActive,
                      ]}
                      onPress={() => setSelectedCategory(category)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selectedCategory === category && styles.categoryButtonTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Event Cards */}
                {mappedEvents.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No events found</Text>
                    <Text style={styles.emptySubtext}>
                      Try adjusting your filters or create a new event
                    </Text>
                  </View>
                ) : (
                  <View style={styles.eventsList}>
                    {mappedEvents.map((event) => (
                      <Event
                        key={event.id}
                        event={event}
                        onJoin={handleJoin}
                        onShare={handleShare}
                        onSave={handleSave}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyStateSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#4E4C57',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  createEventButton: {
    backgroundColor: '#E8D5FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  createEventButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  myEventsSection: {
    paddingTop: 8,
  },
  myEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  myEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  discoverSection: {
    paddingTop: 8,
  },
  discoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  discoverTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  exploreAllText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryButtonActive: {
    backgroundColor: '#E8D5FF',
    borderColor: '#E8D5FF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4E4C57',
    fontFamily: 'Montserrat_500Medium',
  },
  categoryButtonTextActive: {
    color: '#0D0A1B',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  eventsList: {
    paddingTop: 8,
  },
  exploreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'red',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  retryButton: {
    backgroundColor: '#E8D5FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4E4C57',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});
