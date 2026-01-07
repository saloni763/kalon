import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

interface Notification {
  id: string;
  type: 'liked' | 'recommendation' | 'follower' | 'message' | 'event' | 'career';
  profilePictures: string[];
  text: string;
  time: string;
  thumbnail?: string;
  actionButton?: {
    label: string;
    onPress: () => void;
  };
  icon?: string;
}

const notifications: Notification[] = [
  // New Notifications
  {
    id: '1',
    type: 'liked',
    profilePictures: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    ],
    text: 'Emily, Jake, and 63 others liked your photos.',
    time: 'Just now',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
  },
  {
    id: '2',
    type: 'recommendation',
    profilePictures: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'],
    text: 'Rahul recommended Priya\'s profile to you.',
    time: '2h ago',
    actionButton: {
      label: 'View Profile',
      onPress: () => console.log('View Profile'),
    },
  },
  // Earlier Today
  {
    id: '3',
    type: 'liked',
    profilePictures: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    ],
    text: 'Emily, Jake, and 63 others liked your post.',
    time: '3:00 pm',
  },
  {
    id: '4',
    type: 'follower',
    profilePictures: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'],
    text: 'Olivia started following you.',
    time: '11:00 am',
    actionButton: {
      label: 'Follow Back',
      onPress: () => console.log('Follow Back'),
    },
  },
  {
    id: '5',
    type: 'message',
    profilePictures: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150'],
    text: 'New message from Chloe.',
    time: '9:20 am',
    actionButton: {
      label: 'View',
      onPress: () => console.log('View Message'),
    },
  },
  {
    id: '6',
    type: 'event',
    profilePictures: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'],
    text: 'Mike invited you to join \'Product Hackathon 2025\'.',
    time: '9:00 am',
    actionButton: {
      label: 'Join',
      onPress: () => console.log('Join Event'),
    },
  },
  // Yesterday
  {
    id: '7',
    type: 'career',
    profilePictures: [],
    text: '3 new students matched your career interest: UX Design.',
    time: '9:00 am',
    actionButton: {
      label: 'View Matches',
      onPress: () => console.log('View Matches'),
    },
    icon: 'career',
  },
];

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function NotificationsListScreen() {
  const groupedNotifications = {
    new: notifications.slice(0, 2),
    earlierToday: notifications.slice(2, 6),
    yesterday: notifications.slice(6),
  };

  const renderProfilePictures = (pictures: string[], count?: number) => {
    if (pictures.length === 0) return null;
    
    if (pictures.length === 1) {
      return (
        <View style={styles.singleProfileContainer}>
          <Image
            source={{ uri: pictures[0] }}
            style={styles.profileImage}
          />
        </View>
      );
    }

    // Stacked profile pictures - back image larger, front image smaller and overlapping
    return (
      <View style={styles.stackedProfileContainer}>
        <Image
          source={{ uri: pictures[0] }}
          style={[styles.profileImage, styles.backProfileImage]}
        />
        <View style={styles.frontProfileImageContainer}>
          <Image
            source={{ uri: pictures[1] }}
            style={styles.frontProfileImage}
          />
        </View>
      </View>
    );
  };

  const renderNotificationIcon = (type: string) => {
    if (type === 'career') {
      return (
        <View style={styles.careerIconContainer}>
          <View style={styles.careerIcon}>
            <Text style={styles.careerIconText}>📋</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderNotification = (notification: Notification) => (
    <View key={notification.id} style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        {notification.profilePictures.length > 0
          ? renderProfilePictures(notification.profilePictures)
          : renderNotificationIcon(notification.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{notification.text}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      <View style={styles.notificationRight}>
        {notification.thumbnail && (
          <Image
            source={{ uri: notification.thumbnail }}
            style={styles.thumbnail}
          />
        )}
        {notification.actionButton && !notification.thumbnail && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={notification.actionButton.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              {notification.actionButton.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* New Section */}
          {groupedNotifications.new.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>New</Text>
              {groupedNotifications.new.map(renderNotification)}
            </View>
          )}

          {/* Earlier Today Section */}
          {groupedNotifications.earlierToday.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earlier Today</Text>
              {groupedNotifications.earlierToday.map(renderNotification)}
            </View>
          )}

          {/* Yesterday Section */}
          {groupedNotifications.yesterday.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yesterday</Text>
              {groupedNotifications.yesterday.map(renderNotification)}
            </View>
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
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4E4C57',
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationLeft: {
    marginRight: 12,
    width: 48,
    height: 48,
  },
  singleProfileContainer: {
    width: 48,
    height: 48,
  },
  stackedProfileContainer: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
  },
  backProfileImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  frontProfileImageContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 18,
    zIndex: 2,
  },
  frontProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  careerIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  careerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  careerIconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  notificationTime: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  notificationRight: {
    marginLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  actionButton: {
    backgroundColor: '#AF7DFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

