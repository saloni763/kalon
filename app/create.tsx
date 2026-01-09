import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { useUser } from '@/hooks/queries/useAuth';
import { useCreatePost } from '@/hooks/queries/usePosts';
import { showToast } from '@/utils/toast';

export default function CreateScreen() {
  const [postText, setPostText] = useState('');
  const [replySetting, setReplySetting] = useState<'Anyone' | 'Followers' | 'None'>('Anyone');
  const [isPollActive, setIsPollActive] = useState(false);
  const [pollOptions, setPollOptions] = useState(['Yes', 'No']);
  const [showReplyDropdown, setShowReplyDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const dropdownButtonRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const user = useUser();
  const displayName = user?.name || 'User';
  const profileImageUri = user?.picture || 'https://via.placeholder.com/48';
  
  // React Query mutation for creating posts
  const createPostMutation = useCreatePost();

  const handleClose = () => {
    // Navigate to home page since create is accessed via replace
    router.replace('/homepage/home');
  };

  const handlePost = async () => {
    // Validate poll options if poll is active
    if (isPollActive) {
      const validPollOptions = pollOptions.filter(opt => opt.trim().length > 0);
      if (validPollOptions.length < 2) {
        showToast.error('Poll must have at least 2 options');
        return;
      }
    }

    // Validate post content
    if (!postText.trim()) {
      showToast.error('Post content cannot be empty');
      return;
    }

    try {
      const postData: any = {
        content: postText.trim(),
        replySetting,
      };

      // Add poll options if poll is active
      if (isPollActive) {
        const validPollOptions = pollOptions.filter(opt => opt.trim().length > 0);
        postData.pollOptions = validPollOptions;
        
        // Set poll end date to 24 hours from now
        const pollEndDate = new Date();
        pollEndDate.setHours(pollEndDate.getHours() + 24);
        postData.pollEndDate = pollEndDate.toISOString();
      }

      // Use React Query mutation
      await createPostMutation.mutateAsync(postData);
      
      showToast.success('Post created successfully!');
      
      // Reset form
      setPostText('');
      setIsPollActive(false);
      setPollOptions(['Yes', 'No']);
      setReplySetting('Anyone');
      
      // Navigate back to home
      setTimeout(() => {
        router.replace('/homepage/home');
      }, 500);
    } catch (error: any) {
      showToast.error(error.message || 'Failed to create post. Please try again.');
    }
  };

  const handleReplySettingPress = () => {
    if (!showReplyDropdown && dropdownButtonRef.current) {
      dropdownButtonRef.current.measureInWindow((x, y, width, height) => {
        // Calculate dropdown position: positioned to the right of the button
        const dropdownWidth = 200; // minWidth from styles
        setDropdownPosition({
          x: x + width, // Position to the right of the button
          y: y - 10, // Position slightly above the button
        });
        setShowReplyDropdown(true);
      });
    } else {
      setShowReplyDropdown(!showReplyDropdown);
    }
  };

  const handleSelectReplySetting = (setting: 'Anyone' | 'Followers' | 'None') => {
    setReplySetting(setting);
    setShowReplyDropdown(false);
  };

  const handlePollButtonPress = () => {
    setIsPollActive(true);
  };

  const handleRemovePoll = () => {
    setIsPollActive(false);
    setPollOptions(['Yes', 'No']); // Reset to default
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) { // Max 6 options
      setPollOptions([...pollOptions, '']);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) { // Minimum 2 options
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={20} color="#0D0A1B" />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Post</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {/* User Info */}
            <View style={styles.userInfo}>
              <Image
                source={{ uri: profileImageUri }}
                style={styles.profileImage}
                defaultSource={require('@/assets/images/icon.png')}
              />
              <View style={styles.userNameRow}>
                <Text style={styles.username}>{displayName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#AF7DFF" style={styles.verifiedBadge} />
              </View>
            </View>

            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder="What do you want to talk about?"
              placeholderTextColor="#999999"
              value={postText}
              onChangeText={setPostText}
              multiline
              textAlignVertical="top"
            />

            {/* Poll Button - Only show if poll is not active */}
            {!isPollActive && (
              <TouchableOpacity style={styles.pollButton} onPress={handlePollButtonPress}>
                <Ionicons name="menu" size={20} color="#AF7DFF" style={styles.pollIcon} />
                <Text style={styles.pollButtonText}>Poll</Text>
              </TouchableOpacity>
            )}

            {/* Poll Options - Show when poll is active */}
            {isPollActive && (
              <View style={styles.pollContainer}>
                {pollOptions.map((option, index) => (
                  <View key={index} style={styles.pollOptionContainer}>
                    <TextInput
                      style={styles.pollOptionInput}
                      placeholder={`Option ${index + 1}`}
                      placeholderTextColor="#999999"
                      value={option}
                      onChangeText={(value) => handlePollOptionChange(index, value)}
                    />
                    {pollOptions.length > 2 && (
                      <TouchableOpacity
                        onPress={() => handleRemovePollOption(index)}
                        style={styles.removeOptionButton}
                      >
                        <Ionicons name="close-circle" size={20} color="#999999" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                {pollOptions.length < 6 && (
                  <TouchableOpacity style={styles.addOptionButton} onPress={handleAddPollOption}>
                    <Text style={styles.addOptionText}>+ Add another option</Text>
                  </TouchableOpacity>
                )}

                {/* Poll Footer - Remove Poll and Duration */}
                <View style={styles.pollFooter}>
                  <TouchableOpacity style={styles.removePollButton} onPress={handleRemovePoll}>
                    <View style={styles.removePollIconContainer}>
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.removePollText}>Remove Poll</Text>
                  </TouchableOpacity>
                  <Text style={styles.pollDurationText}>Ends in 24h</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
            {/* Reply Settings */}
            <View style={styles.replySettingsContainer}>
              <Text style={styles.replySettingsLabel}>Who can reply or quote</Text>
              <View style={styles.dropdownContainer}>
                <View ref={dropdownButtonRef} collapsable={false}>
                  <TouchableOpacity 
                    style={styles.replySettingsButton} 
                    onPress={handleReplySettingPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.replySettingsButtonText}>{replySetting}</Text>
                    <Ionicons 
                      name={showReplyDropdown ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#AF7DFF" 
                      style={styles.replySettingsIcon} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Post Button */}
            <TouchableOpacity 
              style={[
                styles.postButton, 
                (!postText.trim() || (isPollActive && pollOptions.some(opt => !opt.trim())) || createPostMutation.isPending) && styles.postButtonDisabled
              ]}
              onPress={handlePost}
              disabled={!postText.trim() || (isPollActive && pollOptions.some(opt => !opt.trim())) || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Dropdown Modal */}
      {showReplyDropdown && (
        <Modal
          visible={showReplyDropdown}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowReplyDropdown(false)}
        >
          <Pressable 
            style={styles.backdrop}
            onPress={() => setShowReplyDropdown(false)}
          >
            <View 
              style={[
                styles.modalDropdownContainer,
                { left: dropdownPosition.x, top: dropdownPosition.y }
              ]}
              pointerEvents="box-none"
            >
              <View style={styles.dropdownMenu} pointerEvents="auto">
                {(['Anyone', 'Followers', 'None'] as const).map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      replySetting === option && styles.dropdownOptionSelected,
                      index === 2 && styles.dropdownOptionLast
                    ]}
                    onPress={() => handleSelectReplySetting(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      replySetting === option && styles.dropdownOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                    {replySetting === option && (
                      <Ionicons name="checkmark" size={18} color="#AF7DFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding to ensure buttons are accessible above keyboard
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  headerSpacer: {
    width: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginRight: 6,
    fontFamily: 'Montserrat_700Bold',
  },
  verifiedBadge: {
    marginLeft: 0,
  },
  textInput: {
    fontSize: 16,
    color: '#0D0A1B',
    minHeight: 30,
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  pollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  
  },
  pollIcon: {
    marginRight: 8,
  },
  pollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pollContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  pollOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pollOptionInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  removeOptionButton: {
    marginLeft: 8,
    padding: 4,
  },
  addOptionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 14,
    color: '#4E4C57',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  pollFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  removePollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AF7DFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  removePollIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  removePollText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pollDurationText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  replySettingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  replySettingsLabel: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  replySettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  replySettingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AF7DFF',
    marginRight: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  replySettingsIcon: {
    marginLeft: 0,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
    elevation: 1000,
  },
  dropdownMenu: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 1002,
    minWidth: 200,
    zIndex: 1001,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  dropdownOptionSelected: {
    backgroundColor: '#F5EEFF',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  dropdownOptionTextSelected: {
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  postButton: {
    backgroundColor: '#AF7DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalDropdownContainer: {
    position: 'absolute',
    zIndex: 10000,
  },
});

