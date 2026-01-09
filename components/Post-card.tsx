import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Post as PostType } from '@/services/postService';
import VerifiedBadge from './ui/VerifiedBadge';

interface PostProps {
  post: PostType;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onMenuPress?: (postId: string) => void;
  onSave?: (postId: string, post?: PostType) => void;
  onNotInterested?: (postId: string) => void;
  onCopyLink?: (postId: string) => void;
  onNotify?: (postId: string, post?: PostType) => void;
  onMute?: (postId: string) => void;
  onUnfollow?: (postId: string) => void;
  onReport?: (postId: string) => void;
  isLiked?: boolean;
}

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }
};

// Helper function to extract hashtags from content
const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w]+/g;
  const matches = content.match(hashtagRegex);
  return matches || [];
};

// Helper function to format number (e.g., 23500 -> "23.5k")
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to calculate poll percentages (mock data for now)
const calculatePollPercentages = (pollOptions: string[]): number[] => {
  // For now, return mock percentages
  // In a real app, you'd get this from the backend
  if (pollOptions.length === 3) {
    return [6, 14, 80]; // Mock percentages matching the image
  }
  return pollOptions.map(() => Math.floor(100 / pollOptions.length));
};

export default function Post({
  post,
  onLike,
  onComment,
  onShare,
  onMenuPress,
  onSave,
  onNotInterested,
  onCopyLink,
  onNotify,
  onMute,
  onUnfollow,
  onReport,
  isLiked = false,
}: PostProps) {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [showMuteConfirm, setShowMuteConfirm] = useState(false);
  const hashtags = extractHashtags(post.content);
  const contentWithoutHashtags = post.content.replace(/#[\w]+/g, '').trim();
  const isPoll = post.pollOptions && post.pollOptions.length > 0;
  const pollPercentages = isPoll ? calculatePollPercentages(post.pollOptions!) : [];

  // Get username from email (before @) or use a default
  const username = post.userId.email
    ? `@${post.userId.email.split('@')[0]}`
    : '@user';

  const handleMenuPress = () => {
    setShowOptionsModal(true);
    onMenuPress?.(post.id);
  };

  const handleOptionPress = (action: () => void | undefined) => {
    setShowOptionsModal(false);
    action?.();
  };

  const handleUnfollowPress = () => {
    setShowOptionsModal(false);
    setShowUnfollowConfirm(true);
  };

  const handleConfirmUnfollow = () => {
    setShowUnfollowConfirm(false);
    onUnfollow?.(post.id);
  };

  const handleCancelUnfollow = () => {
    setShowUnfollowConfirm(false);
  };

  const handleMutePress = () => {
    setShowOptionsModal(false);
    setShowMuteConfirm(true);
  };

  const handleConfirmMute = () => {
    setShowMuteConfirm(false);
    onMute?.(post.id);
  };

  const handleCancelMute = () => {
    setShowMuteConfirm(false);
  };

  return (
    <View style={styles.post}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        {/* Profile Image with + badge */}
        <View style={styles.postProfileImage}>
          {post.userId.picture ? (
            <Image
              source={{ uri: post.userId.picture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>
                {getInitials(post.userId.name)}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.addIconBadge}
            onPress={() => router.push('/create')}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={12} color="#AF7DFF" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.postHeaderText}>
          <View style={styles.postNameRow}>
            <Text style={styles.postName}>{post.userId.name}</Text>
            <View style={styles.verifiedBadge}>
                      <VerifiedBadge width={16} height={16} color="#7436D7" />
                    </View>
            </View>
            <View style={styles.postHandleRow}>
              <Text style={styles.postHandle}>{username}</Text>
              <Text style={styles.postTime}> · {formatTime(post.createdAt)}</Text>
            </View>
        </View>

        {/* Three-dot menu */}
        <TouchableOpacity
          onPress={handleMenuPress}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#4E4C57" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      {contentWithoutHashtags ? (
        <Text style={styles.postContent}>{contentWithoutHashtags}</Text>
      ) : null}

      {/* Poll Options */}
      {isPoll && post.pollOptions && (
        <View style={styles.pollContainer}>
          {post.pollOptions.map((option, index) => {
            const percentage = pollPercentages[index] || 0;
            const isWinning = percentage === Math.max(...pollPercentages);

            return (
              <View key={index} style={styles.pollOption}>
                {/* Progress Bar Background */}
                <View style={styles.pollProgressContainer}>
                  <View
                    style={[
                      styles.pollProgressBar,
                      { width: `${percentage}%` },
                      isWinning && styles.pollProgressBarActive,
                    ]}
                  />
                </View>

                {/* Poll Option Content */}
                <View style={styles.pollOptionContent}>
                  <View style={styles.pollOptionRow}>
                    <Text
                      style={[
                        styles.pollOptionText,
                        isWinning && styles.pollOptionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {percentage > 0 && (
                      <Text
                        style={[
                          styles.pollPercentage,
                          isWinning && styles.pollPercentageActive,
                        ]}
                      >
                        {percentage}%
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <View style={styles.hashtagsContainer}>
          {hashtags.map((hashtag, index) => (
            <Text key={index} style={styles.hashtag}>
              {hashtag}
            </Text>
          ))}
        </View>
      )}

      {/* Engagement Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike?.(post.id)}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#AF7DFF' : '#4E4C57'}
          />
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
            {formatNumber(post.likes)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#AF7DFF" />
          <Text style={[styles.actionText, styles.actionTextPurple]}>
            {formatNumber(post.replies)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare?.(post.id)}
        >
          <Ionicons name="share-outline" size={20} color="#AF7DFF" />
          <Text style={[styles.actionText, styles.actionTextPurple]}>
            {formatNumber(post.likes)} {/* Using likes as share count for now */}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalOverlayPressable}
            onPress={() => setShowOptionsModal(false)}
          />
          <View style={styles.modalContent}>
            {/* Drag Handle */}
            <View style={styles.modalHandle} />

            {/* Options List */}
            <View style={styles.optionsList}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleOptionPress(() => onSave?.(post.id, post))}
              >
                <Ionicons name="bookmark-outline" size={24} color="#AF7DFF" />
                <Text style={styles.optionText}>Save</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleOptionPress(() => onNotInterested?.(post.id))}
              >
                <Ionicons name="close-circle-outline" size={24} color="#AF7DFF" />
                <Text style={styles.optionText}>Not interested</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleOptionPress(() => onCopyLink?.(post.id))}
              >
                <Ionicons name="link-outline" size={24} color="#AF7DFF" />
                <Text style={styles.optionText}>Copy link</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleOptionPress(() => onNotify?.(post.id, post))}
              >
                <Ionicons name="notifications-outline" size={24} color="#AF7DFF" />
                <Text style={styles.optionText}>Notify me</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleMutePress}
              >
                <Ionicons name="volume-mute-outline" size={24} color="#AF7DFF" />
                <Text style={styles.optionText}>Mute</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleUnfollowPress}
              >
                <Ionicons name="person-remove-outline" size={24} color="#AF7DFF" />
                <Text style={styles.optionText}>Unfollow</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleOptionPress(() => onReport?.(post.id))}
              >
                <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
                <Text style={[styles.optionText, styles.optionTextDanger]}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unfollow Confirmation Modal */}
      <Modal
        visible={showUnfollowConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelUnfollow}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>
              Unfollow {post.userId.name}?
            </Text>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmUnfollow}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Unfollow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelUnfollow}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mute Confirmation Modal */}
      <Modal
        visible={showMuteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelMute}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>
              Mute {post.userId.name}?
            </Text>
            
            <Text style={styles.confirmModalDescription}>
              You can unmute them from their profile. Kalon won't let them know you muted them.
            </Text>
            
            <TouchableOpacity
              style={styles.muteConfirmButton}
              onPress={handleConfirmMute}
              activeOpacity={0.8}
            >
              <Text style={styles.muteConfirmButtonText}>Mute posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelMute}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  post: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postProfileImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    position: 'relative',
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
  addIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  postHeaderText: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  postHandleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  postName: {
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
  postHandle: {
    fontSize: 14,
    color: '#4E4C57',
    marginRight: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  postTime: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  menuButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: '#0D0A1B',
    lineHeight: 24,
    marginBottom: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  pollContainer: {
    marginBottom: 12,
    gap: 8,
  },
  pollOption: {
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    minHeight: 48,
    padding: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pollProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
  },
  pollProgressBar: {
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  pollProgressBarActive: {
    backgroundColor: '#AF7DFF',
  },
  pollOptionContent: {
    position: 'relative',
    zIndex: 1,
  },
  pollOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollOptionText: {
    fontSize: 14,
    color: '#0D0A1B',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  pollOptionTextActive: {
    color: '#0D0A1B',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pollPercentage: {
    fontSize: 14,
    color: '#4E4C57',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  pollPercentageActive: {
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  hashtag: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#4E4C57',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  actionTextLiked: {
    color: '#AF7DFF',
  },
  actionTextPurple: {
    color: '#AF7DFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayPressable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  optionTextDanger: {
    color: '#FF3B30',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 40,
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Montserrat_700Bold',
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#AF7DFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  confirmModalDescription: {
    fontSize: 14,
    color: '#4E4C57',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  muteConfirmButton: {
    backgroundColor: '#AF7DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  muteConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

