import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import { useBlockedUsers, useUnblockUser } from '@/hooks/queries/useAuth';
import { User as UserType } from '@/services/authService';
import { showToast } from '@/utils/toast';

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function BlockedUsersScreen() {
  const { data: blockedUsers, isLoading, isError, isRefetching, refetch } = useBlockedUsers();
  const unblockMutation = useUnblockUser();

  const handleUnblock = (userId: string, userName: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${userName}? They will be able to see your posts and interact with you again.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          style: 'default',
          onPress: () => {
            unblockMutation.mutate(userId, {
              onSuccess: () => {
                showToast.success(`${userName} has been unblocked`);
                refetch();
              },
              onError: (error: any) => {
                showToast.error(error.message || 'Failed to unblock user');
              },
            });
          },
        },
      ]
    );
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
            <Text style={styles.headerTitle}>Blocked Users</Text>
          </View>
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
              <Text style={styles.errorText}>Failed to load blocked users</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !blockedUsers || blockedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No blocked users</Text>
              <Text style={styles.emptySubtext}>Users you block will appear here</Text>
            </View>
          ) : (
            blockedUsers.map((user) => {
              const isPending = unblockMutation.isPending && unblockMutation.variables === user.id;
              
              return (
                <View key={user.id} style={styles.userItem}>
                  <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => handleUserPress(user.id)}
                    activeOpacity={0.7}
                  >
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                      {user.picture ? (
                        <Image 
                          source={{ uri: user.picture }} 
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                        </View>
                      )}
                    </View>

                    {/* User Info */}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.name}
                      </Text>
                      {user.email && (
                        <Text style={styles.userEmail} numberOfLines={1}>
                          {user.email}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Unblock Button */}
                  <TouchableOpacity
                    style={[styles.unblockButton, isPending && styles.unblockButtonDisabled]}
                    onPress={() => handleUnblock(user.id, user.name)}
                    disabled={isPending}
                    activeOpacity={0.7}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="#AF7DFF" />
                    ) : (
                      <Text style={styles.unblockButtonText}>Unblock</Text>
                    )}
                  </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#AF7DFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
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
    gap: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  userEmail: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  unblockButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F5EEFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#AF7DFF',
  },
  unblockButtonDisabled: {
    opacity: 0.6,
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

