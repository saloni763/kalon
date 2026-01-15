import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchIcon from '@/components/ui/SearchIcon';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { SearchUser, SearchPost } from '@/services/searchService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSearchUsers, useSearchPosts } from '@/hooks/queries/useSearch';
import { FilterState } from '@/components/FilterModal';

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

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<SearchUser[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

  // Load filters when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFilters();
    }, [])
  );

  const loadFilters = async () => {
    try {
      const stored = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
      if (stored) {
        setAppliedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  // React Query hooks for search
  const hasSearchQuery = searchQuery.trim().length > 0;
  const shouldSearchUsers = activeTab === 'people' && hasSearchQuery;
  const shouldSearchPosts = activeTab === 'post' && hasSearchQuery;

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useSearchUsers(searchQuery, 1, 20, shouldSearchUsers);

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useSearchPosts(searchQuery, 1, 20, shouldSearchPosts);

  const searchResults = usersData?.users || [];
  const postResults = postsData?.posts || [];
  const error = usersError?.message || postsError?.message || null;

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

  const handleFollowToggle = (userId: string, isSuggested: boolean = false) => {
    // TODO: Implement actual follow/unfollow API call with mutation
    if (isSuggested) {
      setSuggestedPeople(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    }
    // Note: For search results, we'd need to invalidate the query cache
    // after a successful follow/unfollow mutation
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

  const renderPostTab = () => {
    if (!hasSearchQuery) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Enter a search query or hashtag to find posts</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {postResults.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postItem}
                onPress={() => {
                  // TODO: Navigate to post detail or handle post press
                }}
                activeOpacity={0.7}
              >
                <View style={styles.postHeader}>
                  <View style={styles.profileImageContainer}>
                    {post.userId.picture ? (
                      <Image
                        source={{ uri: post.userId.picture }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImageText}>
                          {getInitials(post.userId.name)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.postUserInfo}>
                    <Text style={styles.postUserName}>{post.userId.name}</Text>
                    <Text style={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postStats}>
                  <View style={styles.postStatItem}>
                    <Ionicons name="heart" size={16} color={post.isLiked ? "#7436D7" : "#4E4C57"} />
                    <Text style={styles.postStatText}>{post.likes}</Text>
                  </View>
                  <View style={styles.postStatItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#4E4C57" />
                    <Text style={styles.postStatText}>{post.replies}</Text>
                  </View>
                  <View style={styles.postStatItem}>
                    <Ionicons name="share-outline" size={16} color="#4E4C57" />
                    <Text style={styles.postStatText}>{post.shares}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderEventsTab = () => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Events search coming soon</Text>
      </View>
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
});

