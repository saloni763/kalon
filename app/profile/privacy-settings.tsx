import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import { usePrivacySettings, useUpdatePrivacySettings } from '@/hooks/queries/usePrivacySettings';
import type { ProfileVisibilityOption, MessageOption } from '@/services/privacySettingsService';

export default function PrivacySettingsScreen() {
  // React Query hooks
  const { data, isLoading, error } = usePrivacySettings();
  const updateMutation = useUpdatePrivacySettings();

  // Local state synced with query data
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibilityOption>('everyone');
  const [whoCanMessage, setWhoCanMessage] = useState<MessageOption>('everyone');
  const [locationSharing, setLocationSharing] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);

  // Sync local state with query data when it loads
  useEffect(() => {
    if (data?.privacySettings) {
      setProfileVisibility(data.privacySettings.profileVisibility);
      setWhoCanMessage(data.privacySettings.whoCanMessage);
      setLocationSharing(data.privacySettings.locationSharing);
      setOnlineStatus(data.privacySettings.onlineStatus);
    }
  }, [data]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load privacy settings',
        [{ text: 'OK' }]
      );
    }
  }, [error]);

  // Handle update errors
  useEffect(() => {
    if (updateMutation.isError) {
      Alert.alert(
        'Update Failed',
        updateMutation.error instanceof Error
          ? updateMutation.error.message
          : 'Failed to update privacy settings',
        [{ text: 'OK' }]
      );
    }
  }, [updateMutation.isError, updateMutation.error]);

  // Update function with debouncing for better UX
  const updateSetting = (updates: {
    profileVisibility?: ProfileVisibilityOption;
    whoCanMessage?: MessageOption;
    locationSharing?: boolean;
    onlineStatus?: boolean;
  }) => {
    updateMutation.mutate(updates);
  };

  const handleBlockedUsers = () => {
    router.push('/profile/blocked-users' as any);
  };

  const handleProfileVisibilityChange = (value: ProfileVisibilityOption) => {
    setProfileVisibility(value);
    updateSetting({ profileVisibility: value });
  };

  const handleWhoCanMessageChange = (value: MessageOption) => {
    setWhoCanMessage(value);
    updateSetting({ whoCanMessage: value });
  };

  const handleLocationSharingChange = (value: boolean) => {
    setLocationSharing(value);
    updateSetting({ locationSharing: value });
  };

  const handleOnlineStatusChange = (value: boolean) => {
    setOnlineStatus(value);
    updateSetting({ onlineStatus: value });
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

  // Show loading indicator while fetching initial data
  if (isLoading && !data) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()}>
                <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Privacy</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AF7DFF" />
            <Text style={styles.loadingText}>Loading privacy settings...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
            {updateMutation.isPending && (
              <ActivityIndicator size="small" color="#AF7DFF" style={styles.headerLoader} />
            )}
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
                onPress={() => handleProfileVisibilityChange('everyone')}
                activeOpacity={0.7}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.optionText}>Everyone</Text>
                <RadioButton
                  selected={profileVisibility === 'everyone'}
                  onPress={() => handleProfileVisibilityChange('everyone')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleProfileVisibilityChange('followers')}
                activeOpacity={0.7}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.optionText}>Followers only</Text>
                <RadioButton
                  selected={profileVisibility === 'followers'}
                  onPress={() => handleProfileVisibilityChange('followers')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleProfileVisibilityChange('onlyMe')}
                activeOpacity={0.7}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.optionText}>Only me</Text>
                <RadioButton
                  selected={profileVisibility === 'onlyMe'}
                  onPress={() => handleProfileVisibilityChange('onlyMe')}
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
                onPress={() => handleWhoCanMessageChange('everyone')}
                activeOpacity={0.7}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.optionText}>Everyone</Text>
                <RadioButton
                  selected={whoCanMessage === 'everyone'}
                  onPress={() => handleWhoCanMessageChange('everyone')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleWhoCanMessageChange('followers')}
                activeOpacity={0.7}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.optionText}>Followers only</Text>
                <RadioButton
                  selected={whoCanMessage === 'followers'}
                  onPress={() => handleWhoCanMessageChange('followers')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleWhoCanMessageChange('noOne')}
                activeOpacity={0.7}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.optionText}>No One</Text>
                <RadioButton
                  selected={whoCanMessage === 'noOne'}
                  onPress={() => handleWhoCanMessageChange('noOne')}
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
                onValueChange={handleLocationSharingChange}
                trackColor={{ false: '#E0E0E0', true: '#AF7DFF' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E0E0E0"
                disabled={updateMutation.isPending}
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
                onValueChange={handleOnlineStatusChange}
                trackColor={{ false: '#E0E0E0', true: '#AF7DFF' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E0E0E0"
                disabled={updateMutation.isPending}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  headerLoader: {
    marginLeft: 8,
  },
});

