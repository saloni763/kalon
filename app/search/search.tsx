import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchIcon from '@/components/ui/SearchIcon';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { SearchUser, SearchPost, SearchEvent, PostFilterState } from '@/services/searchService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSearchUsers, useSearchPosts, useSearchEvents, searchKeys } from '@/hooks/queries/useSearch';
import { FilterState } from '@/components/FilterModal';
import PostCard from '@/components/Post-card';
import { Post } from '@/services/postService';
import { toggleLike } from '@/services/postService';
import { useQueryClient } from '@tanstack/react-query';
import { useFollowUser, useUnfollowUser } from '@/hooks/queries/useAuth';
import { showToast } from '@/utils/toast';
import Event, { EventType } from '@/components/Event-card';
import { Event as BackendEvent } from '@/services/eventService';
import { useUser } from '@/hooks/queries/useAuth';

type TabType = 'recent' | 'people' | 'post' | 'events';

interface RecentSearchItem {
  id: string;
  type: 'profile' | 'query';
  name?: string;
  username?: string;
  picture?: string;
  isVerified?: boolean;
  query?: string;
}

const RECENT_SEARCHES_KEY = '@kalon_recent_searches';
const MAX_RECENT_SEARCHES = 10;

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const FILTERS_STORAGE_KEY = '@kalon_search_filters';
const POST_FILTERS_STORAGE_KEY = '@kalon_post_search_filters';

const categories = ['All Events', 'Music', 'Sports', 'Community'];

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<SearchUser[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const [appliedPostFilters, setAppliedPostFilters] = useState<PostFilterState | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const queryClient = useQueryClient();
  const user = useUser();

  // Load filters when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFilters();
    }, [])
  );

  const loadFilters = async () => {
    try {
      // Load user filters
      const stored = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
      if (stored) {
        setAppliedFilters(JSON.parse(stored));
      }
      // Load post filters
      const postStored = await AsyncStorage.getItem(POST_FILTERS_STORAGE_KEY);
      if (postStored) {
        setAppliedPostFilters(JSON.parse(postStored));
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  // React Query hooks for search
  const hasSearchQuery = searchQuery.trim().length > 0;
  const shouldSearchUsers = activeTab === 'people' && hasSearchQuery;
  const shouldSearchPosts = activeTab === 'post' && hasSearchQuery;
  const shouldSearchEvents = activeTab === 'events' && hasSearchQuery;

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useSearchUsers(searchQuery, 1, 20, shouldSearchUsers, appliedFilters || undefined);

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useSearchPosts(searchQuery, 1, 20, shouldSearchPosts, appliedPostFilters || undefined);

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useSearchEvents(
    searchQuery,
    1,
    50,
    shouldSearchEvents,
    selectedCategory !== 'All Events' ? selectedCategory : undefined
  );

  const searchResults = usersData?.users || [];
  const postResults = postsData?.posts || [];
  const eventResults = eventsData?.events || [];
  const error = usersError?.message || postsError?.message || eventsError?.message || null;

  // Load recent searches from storage on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (item: RecentSearchItem) => {
    try {
      const updated = [item, ...recentSearches.filter(i => i.id !== item.id)].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Save to recent searches when search is performed
  useEffect(() => {
    if (hasSearchQuery && (usersData?.users.length || postsData?.posts.length)) {
      const query = searchQuery.trim();
      // Check if this query is already in recent searches to avoid duplicates
      const isDuplicate = recentSearches.some(
        item => item.type === 'query' && item.query === query
      );
      
      if (!isDuplicate) {
        saveRecentSearch({
          id: Date.now().toString(),
          type: 'query',
          query,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersData, postsData]);

  const handleRemoveRecent = async (id: string) => {
    try {
      const updated = recentSearches.filter(item => item.id !== id);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollowToggle = (userId: string, isSuggested: boolean = false) => {
    const user = isSuggested 
      ? suggestedPeople.find(u => u.id === userId)
      : searchResults.find(u => u.id === userId);
    
    if (!user) return;
    
    const currentlyFollowing = user.isFollowing || false;
    
    if (currentlyFollowing) {
      // Unfollow
      unfollowMutation.mutate(userId, {
        onSuccess: () => {
          showToast.success('Unfollowed');
          // Invalidate all search user queries to refetch with updated following status
          queryClient.invalidateQueries({ queryKey: searchKeys.all });
          // Also update local state for suggested people if applicable
          if (isSuggested) {
            setSuggestedPeople(prev =>
              prev.map(u =>
                u.id === userId ? { ...u, isFollowing: false } : u
              )
            );
          }
        },
        onError: (error: any) => {
          showToast.error(error.message || 'Failed to unfollow user');
        },
      });
    } else {
      // Follow
      followMutation.mutate(userId, {
        onSuccess: () => {
          showToast.success('Following');
          // Invalidate all search user queries to refetch with updated following status
          queryClient.invalidateQueries({ queryKey: searchKeys.all });
          // Also update local state for suggested people if applicable
          if (isSuggested) {
            setSuggestedPeople(prev =>
              prev.map(u =>
                u.id === userId ? { ...u, isFollowing: true } : u
              )
            );
          }
        },
        onError: (error: any) => {
          showToast.error(error.message || 'Failed to follow user');
        },
      });
    }
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  const handleSearchItemPress = (item: RecentSearchItem) => {
    if (item.type === 'profile' && item.id) {
      // Navigate to profile
      router.push(`/profile/${item.id}` as any);
    } else if (item.type === 'query' && item.query) {
      // Set search query and switch to appropriate tab
      setSearchQuery(item.query);
      if (item.query.startsWith('#')) {
        setActiveTab('post');
      } else {
        setActiveTab('people');
      }
    }
  };

  const renderRecentTab = () => {
    if (recentSearches.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recent searches</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {recentSearches.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recentItem}
            onPress={() => handleSearchItemPress(item)}
            activeOpacity={0.7}
          >
            {item.type === 'profile' ? (
              <>
                <View style={styles.profileImageContainer}>
                  {item.picture ? (
                    <Image
                      source={{ uri: item.picture }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImageText}>
                        {item.name ? getInitials(item.name) : 'U'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.recentItemContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.recentItemName}>{item.name}</Text>
                    {item.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <VerifiedBadge width={16} height={16} color="#7436D7" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.recentItemUsername}>{item.username}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.searchIconContainer}>
                  <SearchIcon width={20} height={20} color="#4E4C57" />
                </View>
                <Text style={styles.recentQueryText}>{item.query}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveRecent(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color="#4E4C57" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderPeopleTab = () => {
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {!hasSearchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested People</Text>
            {suggestedPeople.length === 0 ? (
              <Text style={styles.emptyStateText}>No suggestions available</Text>
            ) : (
              suggestedPeople.map((user) => (
              <View key={user.id} style={styles.userItem}>
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => handleUserPress(user.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.profileImageContainer}>
                    {user.picture ? (
                      <Image
                        source={{ uri: user.picture }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImageText}>
                          {getInitials(user.name)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userLocation}>{user.location}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    user.isFollowing && styles.followingButton,
                  ]}
                  onPress={() => handleFollowToggle(user.id, true)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      user.isFollowing && styles.followingButtonText,
                    ]}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
              ))
            )}
          </View>
        )}

        {hasSearchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {isLoadingUsers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7436D7" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No users found</Text>
              </View>
            ) : (
              searchResults.map((user) => (
              <View key={user.id} style={styles.userItem}>
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => handleUserPress(user.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.profileImageContainer}>
                    {user.picture ? (
                      <Image
                        source={{ uri: user.picture }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImageText}>
                          {getInitials(user.name)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      {user.isVerified && (
                        <View style={styles.verifiedBadge}>
                          <VerifiedBadge width={16} height={16} color="#7436D7" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.userLocation}>{user.location}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    user.isFollowing && styles.followingButton,
                  ]}
                  onPress={() => handleFollowToggle(user.id, false)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      user.isFollowing && styles.followingButtonText,
                    ]}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  // Convert SearchPost to Post format for PostCard component
  const convertSearchPostToPost = (searchPost: SearchPost): Post => {
    return {
      id: searchPost.id,
      userId: {
        _id: searchPost.userId._id,
        name: searchPost.userId.name,
        email: searchPost.userId.email,
        picture: searchPost.userId.picture,
      },
      content: searchPost.content,
      replySetting: searchPost.replySetting,
      imageUrl: searchPost.imageUrl,
      pollOptions: searchPost.pollOptions,
      pollEndDate: searchPost.pollEndDate,
      likes: searchPost.likes,
      replies: searchPost.replies,
      shares: searchPost.shares,
      isLiked: searchPost.isLiked,
      createdAt: searchPost.createdAt,
      updatedAt: searchPost.updatedAt,
    };
  };

  const handlePostLike = async (postId: string) => {
    try {
      await toggleLike(postId);
      // Invalidate search queries to refetch
      queryClient.invalidateQueries({ queryKey: ['searchPosts'] });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePostComment = (postId: string) => {
    // TODO: Navigate to post detail or comment screen
    console.log('Comment on post:', postId);
  };

  const handlePostShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  const handlePostMenuPress = (postId: string) => {
    // Options drawer will be handled by PostCard component
    console.log('Menu pressed for post:', postId);
  };

  const renderPostTab = () => {
    if (!hasSearchQuery) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Enter a search keyword or hashtag to find posts</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {isLoadingPosts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7436D7" />
            <Text style={styles.loadingText}>Searching posts...</Text>
          </View>
        ) : postResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No posts found</Text>
          </View>
        ) : (
          <View style={styles.postsContainer}>
            {postResults.map((searchPost) => {
              const post = convertSearchPostToPost(searchPost);
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handlePostLike}
                  onComment={handlePostComment}
                  onShare={handlePostShare}
                  onMenuPress={handlePostMenuPress}
                  isLiked={post.isLiked}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  };

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
  const mapEventToEventType = (event: SearchEvent): EventType => {
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

  const handleEventJoin = (eventId: string) => {
    console.log('Join event:', eventId);
  };

  const handleEventShare = (eventId: string) => {
    console.log('Share event:', eventId);
  };

  const handleEventSave = (eventId: string) => {
    console.log('Save event:', eventId);
  };

  const renderEventsTab = () => {
    if (!hasSearchQuery) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Enter a search keyword to find events</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {isLoadingEvents ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7436D7" />
            <Text style={styles.loadingText}>Searching events...</Text>
          </View>
        ) : eventResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No events found</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {eventResults.map((event) => {
              const mappedEvent = mapEventToEventType(event);
              return (
                <Event
                  key={event.id}
                  event={mappedEvent}
                  onJoin={handleEventJoin}
                  onShare={handleEventShare}
                  onSave={handleEventSave}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recent':
        return renderRecentTab();
      case 'people':
        return renderPeopleTab();
      case 'post':
        return renderPostTab();
      case 'events':
        return renderEventsTab();
      default:
        return renderRecentTab();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIconWrapper}>
              <SearchIcon width={20} height={20} color="#4E4C57" />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#4E4C57"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#4E4C57" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.7}
            onPress={() => router.push({
              pathname: '/search/filter' as any,
              params: { type: activeTab }
            })}
          >
            <Ionicons name="options-outline" size={24} color="#7436D7" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => setActiveTab('recent')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'recent' && styles.activeTabText,
              ]}
            >
              Recent
            </Text>
            {activeTab === 'recent' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'people' && styles.activeTab]}
            onPress={() => setActiveTab('people')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'people' && styles.activeTabText,
              ]}
            >
              People
            </Text>
            {activeTab === 'people' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'post' && styles.activeTab]}
            onPress={() => setActiveTab('post')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'post' && styles.activeTabText,
              ]}
            >
              Post
            </Text>
            {activeTab === 'post' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'events' && styles.activeTabText,
              ]}
            >
              Events
            </Text>
            {activeTab === 'events' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  activeTab: {
    // Active tab styling handled by indicator
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4E4C57',
    fontFamily: 'Montserrat_500Medium',
  },
  activeTabText: {
    color: '#7436D7',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#7436D7',
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  recentItemContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginRight: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  verifiedBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemUsername: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  searchIconContainer: {
    marginRight: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentQueryText: {
    flex: 1,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  section: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0A1B',
    paddingHorizontal: 20,
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginRight: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  userLocation: {
    fontSize: 14,
    color: '#4E4C57',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  followButton: {
    backgroundColor: '#AF7DFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#F5EEFF',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  followingButtonText: {
    color: '#AF7DFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  postItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  postDate: {
    fontSize: 12,
    color: '#4E4C57',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  postContent: {
    fontSize: 15,
    color: '#0D0A1B',
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  postStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postStatText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  postsContainer: {
    paddingVertical: 8,
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
});

