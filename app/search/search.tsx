import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchIcon from '@/components/ui/SearchIcon';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

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

interface User {
  id: string;
  name: string;
  location: string;
  picture?: string;
  isVerified: boolean;
  isFollowing: boolean;
}

// Mock data for recent searches
const mockRecentSearches: RecentSearchItem[] = [
  { id: '1', type: 'profile', name: 'Alex', username: '@studybuddy_alex', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: true },
  { id: '2', type: 'query', query: 'Psychology 101 Study Group' },
  { id: '3', type: 'query', query: '#InternshipAlert' },
  { id: '4', type: 'query', query: 'Resume Building Workshop' },
  { id: '5', type: 'query', query: 'Resume Building Workshop' },
  { id: '6', type: 'profile', name: 'codingclub', username: '@codingclub_official', picture: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150', isVerified: true },
  { id: '7', type: 'query', query: '#ExamTips' },
];

// Mock data for suggested people
const mockSuggestedPeople: User[] = [
  { id: '1', name: 'Antonio Ruiz', location: 'Spain', picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isVerified: false, isFollowing: false },
  { id: '2', name: 'Kathleen Ritchie', location: 'LA', picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isVerified: false, isFollowing: false },
  { id: '3', name: 'Alan Raffaele', location: 'Waynesboro', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: false, isFollowing: false },
];

// Mock data for search results
const mockSearchResults: User[] = [
  { id: '1', name: 'Alex Morgan', location: 'USA', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: false, isFollowing: false },
  { id: '2', name: 'Andrew Lee', location: 'Canada', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: true, isFollowing: false },
  { id: '3', name: 'Amara Singh', location: 'India', picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', isVerified: false, isFollowing: false },
  { id: '4', name: 'Aaron Kim', location: 'South Korea', picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', isVerified: true, isFollowing: true },
  { id: '5', name: 'Anika Patel', location: 'UK', picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isVerified: false, isFollowing: false },
  { id: '6', name: 'Adele Nguyen', location: 'Vietnam', picture: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150', isVerified: false, isFollowing: false },
  { id: '7', name: 'Anastasia Georgiou', location: 'Greece', picture: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150', isVerified: false, isFollowing: true },
  { id: '8', name: 'Ayaka Tanaka', location: 'Japan', picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', isVerified: false, isFollowing: false },
];

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function SearchScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(mockRecentSearches);
  const [suggestedPeople, setSuggestedPeople] = useState<User[]>(mockSuggestedPeople);
  const [searchResults, setSearchResults] = useState<User[]>(mockSearchResults);

  const handleRemoveRecent = (id: string) => {
    setRecentSearches(prev => prev.filter(item => item.id !== id));
  };

  const handleFollowToggle = (userId: string, isSuggested: boolean = false) => {
    if (isSuggested) {
      setSuggestedPeople(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } else {
      setSearchResults(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    }
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  const handleSearchItemPress = (item: RecentSearchItem) => {
    if (item.type === 'profile' && item.name) {
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
    const hasSearchQuery = searchQuery.trim().length > 0;

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!hasSearchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested People</Text>
            {suggestedPeople.map((user) => (
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
            ))}
          </View>
        )}

        {hasSearchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Result</Text>
            {searchResults.map((user) => (
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
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPostTab = () => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Post search coming soon</Text>
      </View>
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
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
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
});

