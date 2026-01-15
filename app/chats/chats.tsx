import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import SearchIcon from '@/components/ui/SearchIcon';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { useSearchUsers } from '@/hooks/queries/useSearch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchUser } from '@/services/searchService';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  profileImage: string;
  isGroup?: boolean;
}

const chats: Chat[] = [
  {
    id: '1',
    name: 'Michael Rodgers',
    lastMessage: 'Hey, are we still meeting at the libr...',
    timestamp: '1 min',
    unreadCount: 2,
    isOnline: true,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '2',
    name: 'Brainstorm Squad',
    lastMessage: 'Thanks for the feedback on my po...',
    timestamp: '2 hour ago',
    isGroup: true,
    profileImage: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Brain',
  },
  {
    id: '3',
    name: 'Tracey Duke',
    lastMessage: 'Group project deadline is next Fr...',
    timestamp: 'Yesterday',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: '4',
    name: 'Curtis Smith',
    lastMessage: 'Haha yeah',
    timestamp: '10 days ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '5',
    name: 'Josephine Daniels',
    lastMessage: 'Let\'s plan the study group for Sun...',
    timestamp: '10 may',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '6',
    name: 'Melissa Davis',
    lastMessage: 'Hey',
    timestamp: '1 month ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '7',
    name: 'Midnight Chillers',
    lastMessage: 'Zoom link is in the group chat, join...',
    timestamp: '3 month ago',
    isGroup: true,
    profileImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150',
  },
  {
    id: '8',
    name: 'Charles Joyce',
    lastMessage: 'Thanks',
    timestamp: '6 month ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '9',
    name: 'Alan Holt',
    lastMessage: 'Okay. Bye',
    timestamp: '1 year ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

interface RecentSearchItem {
  id: string;
  type: 'profile' | 'query';
  name?: string;
  username?: string;
  picture?: string;
  isVerified?: boolean;
  query?: string;
  userId?: string;
}

const RECENT_SEARCHES_KEY = '@kalon_chat_recent_searches';
const MAX_RECENT_SEARCHES = 10;

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function ChatsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'message' | 'channels'>('message');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const totalUnreadCount = chats.filter(chat => chat.unreadCount).reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  // Load recent searches on mount
  useEffect(() => {
    if (isSearchVisible) {
      loadRecentSearches();
    }
  }, [isSearchVisible]);

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

  const handleRemoveRecent = async (id: string) => {
    try {
      const updated = recentSearches.filter(item => item.id !== id);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  // Search users hook
  const hasSearchQuery = searchQuery.trim().length > 0;
  const {
    data: usersData,
    isLoading: isLoadingUsers,
  } = useSearchUsers(searchQuery, 1, 20, hasSearchQuery && isSearchVisible);

  const searchResults = usersData?.users || [];

  // Save to recent searches when user is selected
  const handleUserSelect = (user: SearchUser) => {
    // Save to recent searches
    saveRecentSearch({
      id: user.id,
      type: 'profile',
      name: user.name,
      username: user.email,
      picture: user.picture,
      isVerified: user.isVerified,
      userId: user.id,
    });

    // Navigate to chat
    setIsSearchVisible(false);
    setSearchQuery('');
    router.push(`/chats/${user.id}` as any);
  };

  const handleSearchItemPress = (item: RecentSearchItem) => {
    if (item.type === 'profile' && item.userId) {
      setIsSearchVisible(false);
      setSearchQuery('');
      router.push(`/chats/${item.userId}` as any);
    } else if (item.type === 'query' && item.query) {
      setSearchQuery(item.query);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchVisible(false);
    setSearchQuery('');
  };

  const renderChatItem = (chat: Chat) => (
    <TouchableOpacity
      key={chat.id}
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => router.push(`/chats/${chat.id}` as any)}
    >
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: chat.profileImage }}
          style={styles.profileImage}
        />
        {chat.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
          <Text style={styles.timestamp}>{chat.timestamp}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
          {chat.unreadCount && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={() => setIsSearchVisible(true)}
            >
              <SearchIcon width={24} height={24} color="#7436D7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <MaterialIcons name="more-horiz" size={24} color="#7436D7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'message' && styles.activeTab]}
            onPress={() => setActiveTab('message')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'message' && styles.activeTabText]}>
              Message
            </Text>
            {activeTab === 'message' && totalUnreadCount > 0 && (
              <View style={styles.tabUnreadBadge}>
                <Text style={styles.tabUnreadCount}>{totalUnreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'channels' && styles.activeTab]}
            onPress={() => setActiveTab('channels')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'channels' && styles.activeTabText]}>
              Channels
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {chats.map(renderChatItem)}
        </ScrollView>
      </SafeAreaView>

      {/* Search Modal */}
      <Modal
        visible={isSearchVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseSearch}
      >
        <View style={styles.searchContainer}>
          <SafeAreaView style={styles.searchContent} edges={['top']}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleCloseSearch}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#0D0A1B" />
              </TouchableOpacity>
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
                  autoFocus
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
            </View>

            {/* Search Results */}
            <ScrollView style={styles.searchScrollView} contentContainerStyle={styles.searchScrollContent}>
              {!hasSearchQuery ? (
                // Recent Searches
                recentSearches.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No recent searches</Text>
                  </View>
                ) : (
                  recentSearches.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.searchItem}
                      onPress={() => handleSearchItemPress(item)}
                      activeOpacity={0.7}
                    >
                      {item.type === 'profile' ? (
                        <>
                          <View style={styles.searchProfileImageContainer}>
                            {item.picture ? (
                              <Image
                                source={{ uri: item.picture }}
                                style={styles.searchProfileImage}
                              />
                            ) : (
                              <View style={styles.profileImagePlaceholder}>
                                <Text style={styles.profileImageText}>
                                  {item.name ? getInitials(item.name) : 'U'}
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.searchItemContent}>
                            <View style={styles.nameRow}>
                              <Text style={styles.searchItemName}>{item.name}</Text>
                              {item.isVerified && (
                                <View style={styles.verifiedBadge}>
                                  <VerifiedBadge width={16} height={16} color="#7436D7" />
                                </View>
                              )}
                            </View>
                            <Text style={styles.searchItemUsername}>{item.username}</Text>
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
                  ))
                )
              ) : (
                // Search Results
                isLoadingUsers ? (
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
                    <TouchableOpacity
                      key={user.id}
                      style={styles.searchItem}
                      onPress={() => handleUserSelect(user)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.searchProfileImageContainer}>
                        {user.picture ? (
                          <Image
                            source={{ uri: user.picture }}
                            style={styles.searchProfileImage}
                          />
                        ) : (
                          <View style={styles.profileImagePlaceholder}>
                            <Text style={styles.profileImageText}>
                              {getInitials(user.name)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.searchItemContent}>
                        <View style={styles.nameRow}>
                          <Text style={styles.searchItemName}>{user.name}</Text>
                          {user.isVerified && (
                            <View style={styles.verifiedBadge}>
                              <VerifiedBadge width={16} height={16} color="#7436D7" />
                            </View>
                          )}
                        </View>
                        <Text style={styles.searchItemUsername}>{user.email}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    gap: 8,
    width: '50%',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7436D7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4E4C57',
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeTabText: {
    color: '#7436D7',
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  tabUnreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7436D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabUnreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#29AE18',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
  },
  timestamp: {
    fontSize: 14,
    color: '#4E4C57',
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#4E4C57',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7436D7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Search Modal Styles
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContent: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchScrollView: {
    flex: 1,
  },
  searchScrollContent: {
    paddingTop: 8,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchProfileImageContainer: {
    marginRight: 12,
  },
  searchProfileImage: {
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
  searchItemContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  searchItemName: {
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
  searchItemUsername: {
    fontSize: 14,
    color: '#4E4C57',
    marginTop: 2,
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
});
