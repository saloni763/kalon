import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Post from '@/components/Post-card';
import Event, { EventType } from '@/components/Event-card';
import { usePosts } from '@/hooks/queries/usePosts';
import { Post as PostType } from '@/services/postService';
import { showToast } from '@/utils/toast';
import * as Clipboard from 'expo-clipboard';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

type TabType = 'All' | 'Posts' | 'Events';

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());

  // Mock saved events data - in a real app, this would come from an API
  const mockSavedEvents: EventType[] = [
    {
      id: 'event-1',
      title: 'Mind Matters: Mental Wellness Workshop',
      host: 'Crimson Foundation',
      date: 'August 10, 2023',
      time: '9:30AM - 1:00PM',
      imageUri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      joinedCount: 80,
      isOnline: true,
      isPublic: true,
      tag: 'FDRC',
    },
    {
      id: 'event-2',
      title: 'Mind Matters: Mental Wellness Workshop',
      host: 'CalmCare Foundation',
      date: 'August 16, 2028',
      time: '9:30 AM - 1:00 PM',
      imageUri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      joinedCount: 456,
      isOnline: true,
      isPublic: true,
      tag: 'Public',
    },
  ];

  // Mock saved posts data - in a real app, this would come from an API
  const mockSavedPosts: PostType[] = [
    {
      id: 'saved-post-1',
      userId: {
        _id: 'user-1',
        name: 'Alice Horney',
        email: 'horney01@example.com',
        picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      content: 'Big shoutout to @SarahW for hosting the best resume workshop today 🔥 Learned so much about LinkedIn game. #levelup #careergoals #studentlife #jobsearch',
      replySetting: 'Anyone',
      likes: 33300,
      replies: 3800,
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'saved-post-2',
      userId: {
        _id: 'user-2',
        name: 'Teresa Geurmond',
        email: 'tfordly@example.com',
        picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
      content: '🌿 Quick Hack: Use Motion + Pomodoro = super focus mode. Trust me, it\'s a game changer. 🧠 #studyhacks #productivityhack',
      replySetting: 'Anyone',
      likes: 33300,
      replies: 3800,
      createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'saved-post-3',
      userId: {
        _id: 'user-3',
        name: 'Michael Rodgers',
        email: 'michael_r@example.com',
        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      content: 'Tried the new pizza spot near campus... 10/10 would recommend 🔥🍕 Anyone tried their pasta yet? #FoodOnCampus #LateNightEats',
      replySetting: 'Anyone',
      likes: 23500,
      replies: 3500,
      createdAt: new Date(Date.now() - 1740000).toISOString(), // 29 minutes ago
      updatedAt: new Date().toISOString(),
    },
  ];

  // Fetch posts - in a real app, you'd filter for saved posts
  const { data, isLoading, error, refetch } = usePosts({
    page: 1,
    limit: 20,
  });

  // Use mock saved posts for UI demonstration
  // In production, this would filter actual saved posts from the API
  const savedPostsData = mockSavedPosts;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      showToast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleMenuPress = (postId: string) => {
    console.log('Menu pressed for post:', postId);
  };

  const handleSave = (postId: string, post?: PostType) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        showToast.info('Removed from saved');
      } else {
        newSet.add(postId);
        showToast.saved(() => {
          router.push('/profile/saved');
        });
      }
      return newSet;
    });
  };

  const handleNotInterested = (postId: string) => {
    showToast.info('We\'ll show you less like this');
  };

  const handleCopyLink = async (postId: string) => {
    try {
      const postLink = `https://kalon.app/post/${postId}`;
      await Clipboard.setStringAsync(postLink);
      showToast.linkCopied();
    } catch (error) {
      showToast.error('Failed to copy link');
    }
  };

  const handleNotify = (postId: string, post?: PostType) => {
    const userName = post?.userId?.name || 'this user';
    showToast.notify(userName, () => {
      console.log('Navigate to notification settings');
    });
  };

  const handleMute = (postId: string) => {
    showToast.info('Post muted');
  };

  const handleUnfollow = (postId: string) => {
    showToast.info('Unfollowed user');
  };

  const handleReport = (postId: string) => {
    console.log('Report post:', postId);
  };

  const handleEventJoin = (eventId: string) => {
    console.log('Join event:', eventId);
  };

  const handleEventShare = (eventId: string) => {
    console.log('Share event:', eventId);
  };

  const handleEventSave = (eventId: string) => {
    setSavedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        showToast.info('Removed from saved');
      } else {
        newSet.add(eventId);
        showToast.saved(() => {
          router.push('/profile/saved');
        });
      }
      return newSet;
    });
  };

  // Determine what content to show based on active tab
  // Always use mock data for UI demonstration
  const getContentToShow = () => {
    if (activeTab === 'Posts') {
      return { posts: savedPostsData, events: [] };
    } else if (activeTab === 'Events') {
      return { posts: [], events: mockSavedEvents };
    } else {
      // All tab - show both
      return { posts: savedPostsData, events: mockSavedEvents };
    }
  };

  const { posts, events } = getContentToShow();
  const hasContent = posts.length > 0 || events.length > 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} >
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Saved</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'All' && styles.tabActive]}
            onPress={() => setActiveTab('All')}
          >
            <Text style={[styles.tabText, activeTab === 'All' && styles.tabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Posts' && styles.tabActive]}
            onPress={() => setActiveTab('Posts')}
          >
            <Text style={[styles.tabText, activeTab === 'Posts' && styles.tabTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Events' && styles.tabActive]}
            onPress={() => setActiveTab('Events')}
          >
            <Text style={[styles.tabText, activeTab === 'Events' && styles.tabTextActive]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#AF7DFF"
            />
          }
        >
          {!hasContent ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No saved items yet</Text>
              <Text style={styles.emptySubtext}>
                Save posts and events to view them here
              </Text>
            </View>
          ) : (
            <>
              {/* Show Posts */}
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  isLiked={likedPosts.has(post.id)}
                  onLike={toggleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onMenuPress={handleMenuPress}
                  onSave={handleSave}
                  onNotInterested={handleNotInterested}
                  onCopyLink={handleCopyLink}
                  onNotify={handleNotify}
                  onMute={handleMute}
                  onUnfollow={handleUnfollow}
                  onReport={handleReport}
                />
              ))}

              {/* Show Events */}
              {events.map((event) => (
                <Event
                  key={event.id}
                  event={event}
                  onJoin={handleEventJoin}
                  onShare={handleEventShare}
                  onSave={handleEventSave}
                />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',

  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#AF7DFF',
  },
  tabText: {
    fontSize: 16,
    color: '#4E4C57',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  tabTextActive: {
    color: '#0D0A1B',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4E4C57',
    marginTop: 16,
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

