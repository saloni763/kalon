import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

type ProfileVisibilityOption = 'everyone' | 'followers' | 'onlyMe';
type MessageOption = 'everyone' | 'followers' | 'noOne';

export default function PrivacySettingsScreen() {
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibilityOption>('everyone');
  const [whoCanMessage, setWhoCanMessage] = useState<MessageOption>('everyone');
  const [locationSharing, setLocationSharing] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);

  const handleBlockedUsers = () => {
    // TODO: Navigate to blocked users screen
    console.log('Navigate to blocked users');
  };

  const RadioButton = ({ 
    selected, 
    onPress 
  }: { 
    selected: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.radioButton}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy</Text>
          </View>
        </View>

        {/* Settings List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Profile Visibility */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Visibility</Text>
              <Text style={styles.sectionSubtitle}>Who can see your profile?</Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setProfileVisibility('everyone')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>Everyone</Text>
                <RadioButton
                  selected={profileVisibility === 'everyone'}
                  onPress={() => setProfileVisibility('everyone')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setProfileVisibility('followers')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>Followers only</Text>
                <RadioButton
                  selected={profileVisibility === 'followers'}
                  onPress={() => setProfileVisibility('followers')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setProfileVisibility('onlyMe')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>Only me</Text>
                <RadioButton
                  selected={profileVisibility === 'onlyMe'}
                  onPress={() => setProfileVisibility('onlyMe')}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Who Can Message You */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Who Can Message You</Text>
              <Text style={styles.sectionSubtitle}>Choose who can send you direct messages</Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setWhoCanMessage('everyone')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>Everyone</Text>
                <RadioButton
                  selected={whoCanMessage === 'everyone'}
                  onPress={() => setWhoCanMessage('everyone')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setWhoCanMessage('followers')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>Followers only</Text>
                <RadioButton
                  selected={whoCanMessage === 'followers'}
                  onPress={() => setWhoCanMessage('followers')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setWhoCanMessage('noOne')}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>No One</Text>
                <RadioButton
                  selected={whoCanMessage === 'noOne'}
                  onPress={() => setWhoCanMessage('noOne')}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Blocked Users */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Blocked Users</Text>
              <Text style={styles.sectionSubtitle}>Manage your block list</Text>
            </View>
            <TouchableOpacity
              style={styles.navigationItem}
              onPress={handleBlockedUsers}
              activeOpacity={0.7}
            >
              <Text style={styles.navigationText}>Edit Block Users</Text>
              <View style={styles.arrowIconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Location Sharing */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location Sharing</Text>
              <Text style={styles.sectionSubtitle}>Allow Kalon to share your location in events/posts</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Allow Location</Text>
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                trackColor={{ false: '#E0E0E0', true: '#AF7DFF' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>

          {/* Online Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Online Status</Text>
              <Text style={styles.sectionSubtitle}>Let others see when you're online</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Online</Text>
              <Switch
                value={onlineStatus}
                onValueChange={setOnlineStatus}
                trackColor={{ false: '#E0E0E0', true: '#AF7DFF' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E0E0E0"
              />
            </View>
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
  section: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  optionsContainer: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  radioButton: {
    padding: 4,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#AF7DFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AF7DFF',
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  navigationText: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
});

