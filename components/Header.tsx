import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/queries/useAuth';
import { router } from 'expo-router';
import VerifiedBadge from './ui/VerifiedBadge';
import NotificationsIcon from './ui/NotificationIcon';

interface HeaderProps {
  profileImageUri?: string;
  planName?: string;
  onUpgradePress?: () => void;
  onGlobePress?: () => void;
  onNotificationPress?: () => void;
  activeTab?: 'trending' | 'following';
  onTabChange?: (tab: 'trending' | 'following') => void;
}

export default function Header({
  planName = 'Basic Plan',
  onUpgradePress,
  onGlobePress,
  onNotificationPress,
  activeTab,
  onTabChange,
}: HeaderProps) {
  const user = useUser();
  const displayName = user?.name || 'User';
  // Use profileImageUri prop if provided, otherwise use user's picture, or fallback to placeholder
  const imageUri = user?.picture || 'https://via.placeholder.com/48';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft}
          onPress={() => {
            if (user?.id) {
              router.push(`/profile/${user.id}` as any);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.profileImage}
              defaultSource={require('@/assets/images/icon.png')}
            />
          </View>
          <View style={styles.headerTextContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{displayName}</Text>
              <View style={styles.verifiedBadge}>
                      <VerifiedBadge width={16} height={16} color="#7436D7" />
                    </View>
            </View>
            <View style={styles.planRow}>
              <Text style={styles.planText}>{planName}, </Text>
              <TouchableOpacity onPress={onUpgradePress || (() => router.push('/profile/subscription' as any))}>
                <Text style={styles.upgradeText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={onGlobePress}>
            <View style={styles.iconCircle}>
              <Ionicons name="globe-outline" size={20} color="#007AFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onNotificationPress || (() => router.push('/notifications-list' as any))}
          >
            <View style={styles.iconCircle}>
            <NotificationsIcon width={20} height={20} color="#7436D7" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      {activeTab !== undefined && onTabChange && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
            onPress={() => onTabChange('trending')}
          >
            <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'following' && styles.tabActive]}
            onPress={() => onTabChange('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
              Following
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Bottom-only shadow */}
      <View pointerEvents="none" style={styles.bottomShadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
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
    backgroundColor: '#E0E0E0',
  },
  headerTextContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginRight: 4,
  },
  verifiedBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    fontSize: 12,
    color: '#4E4C57',
  },
  upgradeText: {
    fontSize: 12,
    color: '#AF7DFF',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  bottomShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#FFFFFF',
    // iOS shadow (appears below this 1px strip)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    // Android shadow
    elevation: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 32,
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    width: '50%',
    alignItems: 'center',
  },
  tabActive: {
    borderBottomColor: '#AF7DFF',
  },
  tabText: {
    fontSize: 18,
    color: '#4E4C57',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0D0A1B',
    fontWeight: '600',
  },
});

