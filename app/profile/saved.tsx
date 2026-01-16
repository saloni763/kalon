import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Post from '@/components/Post-card';
import Event, { EventType } from '@/components/Event-card';
import { useSavedPosts, useToggleLike, useToggleSavePost } from '@/hooks/queries/usePosts';
import { useSavedEvents, useToggleSaveEvent } from '@/hooks/queries/useEvents';
import { Post as PostType } from '@/services/postService';
import { Event as BackendEvent } from '@/services/eventService';
import { showToast } from '@/utils/toast';
import * as Clipboard from 'expo-clipboard';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

type TabType = 'All' | 'Posts' | 'Events';

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('All');

  // Fetch saved posts
  const { 
    data: savedPostsData, 
    isLoading: isLoadingPosts, 
    error: postsError, 
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts 
  } = useSavedPosts({
    page: 1,
    limit: 20,
  });

  // Fetch saved events
  const { 
    data: savedEventsData, 
    isLoading: isLoadingEvents, 
    error: eventsError, 
    refetch: refetchEvents,
    isRefetching: isRefetchingEvents 
  } = useSavedEvents({
    page: 1,
    limit: 20,
  });

  const isLoading = isLoadingPosts || isLoadingEvents;
  const isRefetching = isRefetchingPosts || isRefetchingEvents;
  const error = postsError || eventsError;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchPosts(), refetchEvents()]);
    } catch (error) {
      showToast.error('Failed to refresh');
    }
  };

  // Like/unlike mutation
  const toggleLikeMutation = useToggleLike();

  const toggleLike = (postId: string) => {
    toggleLikeMutation.mutate(postId, {
      onError: (error: any) => {
        showToast.error(error.message || 'Failed to update like');
      },
    });
  };

  // Save/unsave mutations
  const toggleSavePostMutation = useToggleSavePost();
  const toggleSaveEventMutation = useToggleSaveEvent();

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
    toggleSavePostMutation.mutate(postId, {
      onSuccess: (data) => {
        if (data.isSaved) {
          showToast.saved(() => {
            router.push('/profile/saved');
          });
        } else {
          showToast.info('Removed from saved');
        }
      },
      onError: (error: any) => {
        showToast.error(error.message || 'Failed to save post');
      },
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
    toggleSaveEventMutation.mutate(eventId, {
      onSuccess: (data) => {
        if (data.isSaved) {
          showToast.saved(() => {
            router.push('/profile/saved');
          });
        } else {
          showToast.info('Removed from saved');
        }
      },
      onError: (error: any) => {
        showToast.error(error.message || 'Failed to save event');
      },
    });
  };

  // Determine what content to show based on active tab
  const getContentToShow = () => {
    const posts = savedPostsData?.posts || [];
    const events = savedEventsData?.events || [];

    if (activeTab === 'Posts') {
      return { posts, events: [] };
    } else if (activeTab === 'Events') {
      return { posts: [], events };
    } else {
      // All tab - show both
      return { posts, events };
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
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#AF7DFF"
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#AF7DFF" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error instanceof Error ? error.message : 'Failed to load saved items'}
              </Text>
              <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !hasContent ? (
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
                  isLiked={post.isLiked || false}
                  isSaved={post.isSaved || false}
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
              {events.map((event) => {
                // Convert Event type to EventType for Event component
                const eventCardData: EventType = {
                  id: event.id,
                  title: event.eventName,
                  host: event.hostBy,
                  date: new Date(event.startDateTime).toLocaleDateString(),
                  time: `${new Date(event.startDateTime).toLocaleTimeString()} - ${new Date(event.endDateTime).toLocaleTimeString()}`,
                  imageUri: event.thumbnailUri || undefined,
                  joinedCount: event.attendees,
                  isOnline: event.eventMode === 'Online',
                  isPublic: event.eventType === 'Public',
                  tag: event.category,
                  isSaved: event.isSaved || false,
                };
                return (
                  <Event
                    key={event.id}
                    event={eventCardData}
                    isSaved={event.isSaved}
                    onJoin={handleEventJoin}
                    onShare={handleEventShare}
                    onSave={handleEventSave}
                  />
                );
              })}
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#AF7DFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

