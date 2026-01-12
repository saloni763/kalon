import { StyleSheet, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Header from '@/components/Header';
import Post from '@/components/Post-card';
import { usePosts } from '@/hooks/queries/usePosts';
import { showToast } from '@/utils/toast';

import { Post as PostType } from '@/services/postService';
import * as Clipboard from 'expo-clipboard';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'trending' | 'following'>('trending');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts using React Query
  const { data, isLoading, error, refetch } = usePosts({
    page: 1,
    limit: 20,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      showToast.error('Failed to refresh posts');
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
    // TODO: Navigate to comments screen
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  const handleMenuPress = (postId: string) => {
    // Modal is handled by Post component
    console.log('Menu pressed for post:', postId);
  };

  const handleSave = (postId: string, post?: PostType) => {
    // TODO: Implement save post functionality
    showToast.saved(() => {
      // Navigate to saved posts screen
      console.log('Navigate to saved posts');
    });
    console.log('Save post:', postId);
  };

  const handleNotInterested = (postId: string) => {
    // TODO: Implement not interested functionality
    showToast.info('We\'ll show you less like this');
    console.log('Not interested in post:', postId);
  };

  const handleCopyLink = async (postId: string) => {
    try {
      // TODO: Generate actual post link
      const postLink = `https://kalon.app/post/${postId}`;
      await Clipboard.setStringAsync(postLink);
      showToast.linkCopied();
      console.log('Copy link for post:', postId);
    } catch (error) {
      showToast.error('Failed to copy link');
      console.error('Error copying link:', error);
    }
  };

  const handleNotify = (postId: string, post?: PostType) => {
    // TODO: Implement notify functionality
    const userName = post?.userId?.name || 'this user';
    showToast.notify(userName, () => {
      // Navigate to notification settings
      console.log('Navigate to notification settings');
    });
    console.log('Notify for post:', postId);
  };

  const handleMute = (postId: string) => {
    // TODO: Implement mute functionality
    showToast.info('Post muted');
    console.log('Mute post:', postId);
  };

  const handleUnfollow = (postId: string) => {
    // TODO: Implement unfollow functionality
    showToast.info('Unfollowed user');
    console.log('Unfollow user from post:', postId);
  };

  const handleReport = (postId: string) => {
    // TODO: Implement report functionality
    showToast.error('Post reported');
    console.log('Report post:', postId);
  };

  const handleVote = (postId: string, optionIndex: number) => {
    // TODO: Implement vote functionality - send to backend
    console.log('Vote on post:', postId, 'option:', optionIndex);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <Header 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {isLoading && !data ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AF7DFF" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            {/* Error state - you can add error UI here */}
          </View>
        ) : (
          <ScrollView
            style={styles.feed}
            contentContainerStyle={styles.feedContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#AF7DFF"
              />
            }
          >
            {data?.posts.map((post) => (
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
                onVote={handleVote}
              />
            ))}
            {data?.posts.length === 0 && (
              <View style={styles.emptyContainer}>
                {/* Empty state - you can add empty UI here */}
              </View>
            )}
          </ScrollView>
        )}
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
  },
  feed: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  feedContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

