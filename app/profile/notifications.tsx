import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

export default function NotificationsScreen() {
  const [pauseAll, setPauseAll] = useState(false);
  const [fromElemyntz, setFromElemyntz] = useState(false);

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case 'Social Activity':
        router.push('/profile/social-activity' as any);
        break;
      case 'Messages':
        router.push('/profile/messages-settings' as any);
        break;
      case 'Channels & Events':
        router.push('/profile/channels-events-settings' as any);
        break;
      case 'Announcements':
        router.push('/profile/announcements-settings' as any);
        break;
      default:
        console.log('Navigate to:', screen);
    }
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
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>

        {/* Settings List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Pause All */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Pause All</Text>
            <Switch
              value={pauseAll}
              onValueChange={setPauseAll}
              trackColor={{ false: '#E0E0E0', true: '#AF7DFF' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          {/* Social Activity */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation('Social Activity')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingText}>Social Activity</Text>
            <View style={styles.arrowIconContainer}>
              <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
            </View>
          </TouchableOpacity>

          {/* Messages */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation('Messages')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingText}>Messages</Text>
            <View style={styles.arrowIconContainer}>
              <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
            </View>
          </TouchableOpacity>

          {/* Channels & Events */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation('Channels & Events')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingText}>Channels & Events</Text>
            <View style={styles.arrowIconContainer}>
              <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
            </View>
          </TouchableOpacity>

          {/* Announcements */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleNavigation('Announcements')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingText}>Announcements</Text>
            <View style={styles.arrowIconContainer}>
              <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
            </View>
          </TouchableOpacity>

          {/* From Elemyntz */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>From Elemyntz</Text>
            <Switch
              value={fromElemyntz}
              onValueChange={setFromElemyntz}
              trackColor={{ false: '#E0E0E0', true: '#AF7DFF' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  arrowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

