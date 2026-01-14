import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import SearchIcon from '@/components/ui/SearchIcon';
import { useFollowers, useFollowing, useFollowUser, useUnfollowUser, useUser } from '@/hooks/queries/useAuth';
import { User as UserType } from '@/services/authService';
import { showToast } from '@/utils/toast';

type ListType = 'followers' | 'following';

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function FollowersFollowingScreen() {
  const { type, userId } = useLocalSearchParams<{ type: ListType; userId?: string }>();
  const listType = type || 'followers';
  const currentUser = useUser();
  
  // Use provided userId or current user's id
  const targetUserId = userId || currentUser?.id;
  
  // Fetch followers or following based on list type
  const followersQuery = useFollowers(listType === 'followers' ? targetUserId : undefined);
  const followingQuery = useFollowing(listType === 'following' ? targetUserId : undefined);
  
  const followersMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  // Get the active query based on list type
  const activeQuery = listType === 'followers' ? followersQuery : followingQuery;
  
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const isRefetching = activeQuery.isRefetching;
  const users = activeQuery.data || [];
  const refetch = activeQuery.refetch;

  const handleFollowToggle = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const currentlyFollowing = user.isFollowing || false;
    
    if (currentlyFollowing) {
      // Unfollow
      unfollowMutation.mutate(userId, {
        onSuccess: () => {
          showToast.success('Unfollowed');
          // React Query will automatically refetch due to query invalidation
        },
        onError: (error: any) => {
          showToast.error(error.message || 'Failed to unfollow user');
        },
      });
    } else {
      // Follow
      followersMutation.mutate(userId, {
        onSuccess: () => {
          showToast.success('Following');
          // React Query will automatically refetch due to query invalidation
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
  
  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {listType === 'followers' ? 'Followers' : 'Following'}
            </Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <View style={styles.searchIconContainer}>
              <SearchIcon width={20} height={20} color="#AF7DFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* User List */}
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
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load {listType}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {listType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
            </View>
          ) : (
            users.map((user) => {
              // Don't show follow button for current user
              const isCurrentUser = user.id === currentUser?.id;
              const isFollowing = user.isFollowing || false;
              // Check if this specific user's mutation is pending
              const isPending = 
                (followersMutation.isPending && followersMutation.variables === user.id) ||
                (unfollowMutation.isPending && unfollowMutation.variables === user.id);
              
              return (
                <View key={user.id} style={styles.userItem}>
                  <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => handleUserPress(user.id)}
                    activeOpacity={0.7}
                  >
                    {/* Profile Picture */}
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

                    {/* User Details */}
                    <View style={styles.userDetails}>
                      <View style={styles.nameRow}>
                        <Text style={styles.userName}>{user.name}</Text>
                        {/* Note: isVerified is not in the User type yet, can be added later */}
                      </View>
                      <Text style={styles.username}>{user.email}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Follow/Following Button - Hide for current user */}
                  {!isCurrentUser && (
                    <TouchableOpacity
                      style={[
                        styles.followButton,
                        isFollowing && styles.followingButton,
                      ]}
                      onPress={() => handleFollowToggle(user.id)}
                      activeOpacity={0.8}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <ActivityIndicator size="small" color={isFollowing ? "#AF7DFF" : "#FFFFFF"} />
                      ) : (
                        <Text
                          style={[
                            styles.followButtonText,
                            isFollowing && styles.followingButtonText,
                          ]}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  searchButton: {
    padding: 4,
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
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
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
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
  username: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  followButton: {
    backgroundColor: '#AF7DFF',
    paddingHorizontal: 14,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#4E4C57',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  retryButton: {
    backgroundColor: '#AF7DFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
});

