import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import SearchIcon from '@/components/ui/SearchIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_FRIENDS_KEY = '@kalon_selected_friends';

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Sample friends data - Replace with actual API data
const SAMPLE_FRIENDS = [
  { id: '1', name: 'Adele Ogletree', username: 'adele98', picture: null, isVerified: false },
  { id: '2', name: 'Richard Rodriguez', username: 'rich_ez', picture: null, isVerified: false },
  { id: '3', name: 'Dana Forcier', username: 'dana-for2', picture: null, isVerified: false },
  { id: '4', name: 'Brandi Johnson', username: 'brandi_joh', picture: null, isVerified: true },
  { id: '5', name: 'Anika Patel', username: 'patel-ani', picture: null, isVerified: false },
  { id: '6', name: 'Adele Nguyen', username: 'adele_nguyen23', picture: null, isVerified: false },
  { id: '7', name: 'Anastasia Georgiou', username: 'georgiou09', picture: null, isVerified: false },
  { id: '8', name: 'Ayaka Tanaka', username: 'tanaka_sd', picture: null, isVerified: false },
  { id: '9', name: 'Ansel Müller', username: 'muller_34', picture: null, isVerified: false },
  { id: '10', name: 'Aaron Kim', username: 'kim2', picture: null, isVerified: true },
];

export default function InviteFriendsScreen() {
  const params = useLocalSearchParams<{ selectedFriends?: string }>();
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  // TODO: Replace with actual friends/following API call
  const friends = SAMPLE_FRIENDS;

  // Load selected friends from params or storage
  useEffect(() => {
    const loadSelectedFriends = async () => {
      if (params.selectedFriends) {
        try {
          const parsed = JSON.parse(params.selectedFriends);
          setSelectedFriends(new Set(parsed));
        } catch (e) {
          // If parsing fails, try loading from storage
          const stored = await AsyncStorage.getItem(SELECTED_FRIENDS_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setSelectedFriends(new Set(parsed));
          }
        }
      } else {
        const stored = await AsyncStorage.getItem(SELECTED_FRIENDS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedFriends(new Set(parsed));
        }
      }
    };
    loadSelectedFriends();
  }, [params.selectedFriends]);

  // Save selected friends to storage whenever they change
  useEffect(() => {
    const saveSelectedFriends = async () => {
      await AsyncStorage.setItem(SELECTED_FRIENDS_KEY, JSON.stringify(Array.from(selectedFriends)));
    };
    saveSelectedFriends();
  }, [selectedFriends]);

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  };

  const handleBack = () => {
    // Save selected friends before going back
    router.back();
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search friends');
  };

  const selectedCount = selectedFriends.size;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friends</Text>
          <TouchableOpacity 
            onPress={handleSearch}
            style={styles.searchButton}
            activeOpacity={0.7}
          >
            <View style={styles.searchIconContainer}>
              <SearchIcon width={20} height={20} color="#AF7DFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Selected Count */}
        <View style={styles.selectedCountContainer}>
          <Text style={styles.selectedCountText}>
            {selectedCount} {selectedCount === 1 ? 'friend' : 'friends'} selected
          </Text>
        </View>

        {/* Friends List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {friends.map((friend) => {
            const isSelected = selectedFriends.has(friend.id);
            
            return (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendItem}
                onPress={() => toggleFriendSelection(friend.id)}
                activeOpacity={0.7}
              >
                {/* Profile Picture */}
                <View style={styles.profileImageContainer}>
                  {friend.picture ? (
                    <Image
                      source={{ uri: friend.picture }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImageText}>
                        {getInitials(friend.name)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Friend Details */}
                <View style={styles.friendDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    {friend.isVerified && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color="#AF7DFF" 
                        style={styles.verifiedBadge}
                      />
                    )}
                  </View>
                  <Text style={styles.username}>@{friend.username}</Text>
                </View>

                {/* Checkbox */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}
                    onPress={() => toggleFriendSelection(friend.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCountContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  friendItem: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  friendDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  username: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#AF7DFF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#AF7DFF',
    borderColor: '#AF7DFF',
  },
});

