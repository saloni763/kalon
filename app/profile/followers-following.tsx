import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import SearchIcon from '@/components/ui/SearchIcon';

type ListType = 'followers' | 'following';

interface User {
  id: string;
  name: string;
  username: string;
  picture?: string;
  isVerified: boolean;
  isFollowing: boolean;
}

// Mock data for followers (people who follow you - most should show "Follow" button)
const mockFollowers: User[] = [
  { id: '1', name: 'Alex Morgan', username: '@alex-m', picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isVerified: false, isFollowing: true },
  { id: '2', name: 'Andrew Lee', username: '@lee_89', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: true, isFollowing: false },
  { id: '3', name: 'Antonio Ruiz', username: '@antonio_r', picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isVerified: false, isFollowing: true },
  { id: '4', name: 'Amara Singh', username: '@amara_s', picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', isVerified: false, isFollowing: true },
  { id: '5', name: 'Aaron Kim', username: '@aaron_k', picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', isVerified: true, isFollowing: false },
  { id: '6', name: 'Anika Patel', username: '@anika_p', picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isVerified: false, isFollowing: true },
  { id: '7', name: 'Adele Nguyen', username: '@adele_n', picture: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150', isVerified: false, isFollowing: false },
  { id: '8', name: 'Anastasia Georgiou', username: '@anastasia_g', picture: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150', isVerified: false, isFollowing: true },
  { id: '9', name: 'Ayaka Tanaka', username: '@ayaka_t', picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', isVerified: false, isFollowing: true },
  { id: '10', name: 'Ansel Müller', username: '@ansel_m', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: false, isFollowing: true },
];

// Mock data for following (people you follow - most should show "Following" button)
const mockFollowing: User[] = [
  { id: '1', name: 'Alex Morgan', username: '@alex-m', picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isVerified: false, isFollowing: true },
  { id: '2', name: 'Andrew Lee', username: '@lee_89', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: true, isFollowing: true },
  { id: '3', name: 'Antonio Ruiz', username: '@antonio_r', picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isVerified: false, isFollowing: true },
  { id: '4', name: 'Amara Singh', username: '@amara_s', picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', isVerified: false, isFollowing: true },
  { id: '5', name: 'Aaron Kim', username: '@aaron_k', picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', isVerified: true, isFollowing: true },
  { id: '6', name: 'Anika Patel', username: '@anika_p', picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isVerified: false, isFollowing: true },
  { id: '7', name: 'Adele Nguyen', username: '@adele_n', picture: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150', isVerified: false, isFollowing: true },
  { id: '8', name: 'Anastasia Georgiou', username: '@anastasia_g', picture: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150', isVerified: false, isFollowing: true },
  { id: '9', name: 'Ayaka Tanaka', username: '@ayaka_t', picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', isVerified: false, isFollowing: true },
  { id: '10', name: 'Ansel Müller', username: '@ansel_m', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isVerified: false, isFollowing: true },
];

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function FollowersFollowingScreen() {
  const { type } = useLocalSearchParams<{ type: ListType }>();
  const listType = type || 'followers';
  const [users, setUsers] = useState<User[]>(
    listType === 'followers' ? mockFollowers : mockFollowing
  );

  const handleFollowToggle = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      )
    );
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {users.map((user) => (
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
                    {user.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <VerifiedBadge width={16} height={16} color="#7436D7" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.username}>{user.username}</Text>
                </View>
              </TouchableOpacity>

              {/* Follow/Following Button */}
              <TouchableOpacity
                style={[
                  styles.followButton,
                  user.isFollowing && styles.followingButton,
                ]}
                onPress={() => handleFollowToggle(user.id)}
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
});

