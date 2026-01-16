import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Post as PostType } from '@/services/postService';
import VerifiedBadge from './ui/VerifiedBadge';
import MuteIcon from '@/assets/icons/mute.svg';
import UnfollowIcon from '@/assets/icons/unfollow.svg';
import ViewProfileIcon from '@/assets/icons/view-profile.svg';
import NotificationIcon from '@/components/ui/NotificationIcon';
import ReportIcon from '@/assets/icons/report.svg';
import CopyLinkIcon from '@/assets/icons/copy-link.svg';
import SaveIcon from '@/assets/icons/bookmark.svg';
import OptionsDrawer, { OptionItem } from './OptionsDrawer';
import ReportDrawer from './ReportDrawer';
import LikeIcon from '@/assets/icons/heart.svg';
import CommentIcon from '@/assets/icons/comment.svg';
import ShareIcon from '@/assets/icons/Share.svg';
import LikedIcon from '@/assets/icons/liked.svg';
import CommentedIcon from '@/assets/icons/commented.svg';
import SharedIcon from '@/assets/icons/shared.svg';
import { useUser } from '@/hooks/queries/useAuth';
import { useDeletePost } from '@/hooks/queries/usePosts';

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
  onFollow?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onVote?: (postId: string, optionIndex: number) => void;
  onDelete?: (postId: string) => void;
  isLiked?: boolean;
  isFollowingUser?: boolean;
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

// Helper function to calculate poll percentages
// Returns all zeros if no votes have been cast
const calculatePollPercentages = (pollOptions: string[], pollVotes?: number[]): number[] => {
  // If no votes data provided, return all zeros (no votes cast yet)
  if (!pollVotes || pollVotes.length === 0) {
    return pollOptions.map(() => 0);
  }
  
  // Calculate total votes
  const totalVotes = pollVotes.reduce((sum, votes) => sum + votes, 0);
  
  // If no votes, return all zeros
  if (totalVotes === 0) {
    return pollOptions.map(() => 0);
  }
  
  // Calculate percentages
  return pollVotes.map(votes => Math.round((votes / totalVotes) * 100));
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
  onFollow,
  onReport,
  onVote,
  onDelete,
  isLiked = false,
  isFollowingUser = false,
}: PostProps) {
  const currentUser = useUser();
  const deletePostMutation = useDeletePost();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [showMuteConfirm, setShowMuteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [isCommented, setIsCommented] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [userVote, setUserVote] = useState<number | null>((post as any).userVoteIndex ?? null);
  const [localPollVotes, setLocalPollVotes] = useState<number[]>((post as any).pollVotes || []);
  
  // Local counts that update immediately for better UX
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.replies || 0);
  const [shareCount, setShareCount] = useState(post.shares || 0);

  // Sync like state with prop changes
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  // Sync counts when post data changes (e.g., after refetch)
  useEffect(() => {
    setLikeCount(post.likes || 0);
    setCommentCount(post.replies || 0);
    setShareCount(post.shares || 0);
  }, [post.likes, post.replies, post.shares]);
  
  const hashtags = extractHashtags(post.content);
  const contentWithoutHashtags = post.content.replace(/#[\w]+/g, '').trim();
  const isPoll = post.pollOptions && post.pollOptions.length > 0;
  const pollPercentages = isPoll ? calculatePollPercentages(post.pollOptions!, localPollVotes) : [];
  const hasPollVotes = pollPercentages.some(p => p > 0);
  const hasUserVoted = userVote !== null;

  // Get username from email (before @) or use a default
  const username = post.userId.email
    ? `@${post.userId.email.split('@')[0]}`
    : '@user';

  // Check if current user owns this post
  const postUserId = typeof post.userId === 'string' ? post.userId : post.userId._id;
  const isOwnPost = currentUser?.id === postUserId;

  const handleMenuPress = () => {
    setShowOptionsModal(true);
    onMenuPress?.(post.id);
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

  const handleFollowPress = () => {
    setShowOptionsModal(false);
    onFollow?.(post.id);
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

  const handleDeletePress = () => {
    setShowOptionsModal(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await deletePostMutation.mutateAsync(post.id);
      onDelete?.(post.id);
      // Show success message (optional)
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete post');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Build options array for the drawer
  const postOptions: OptionItem[] = [
    {
      id: 'save',
      icon: <SaveIcon />,
      text: 'Save',
      onPress: () => onSave?.(post.id, post),
    },
    {
      id: 'not-interested',
      icon: <ViewProfileIcon />,
      text: 'Not interested',
      onPress: () => onNotInterested?.(post.id),
    },
    {
      id: 'copy-link',
      icon: <CopyLinkIcon />,
      text: 'Copy link',
      onPress: () => onCopyLink?.(post.id),
    },
    {
      id: 'notify',
      icon: <NotificationIcon />,
      text: 'Notify me',
      onPress: () => onNotify?.(post.id, post),
    },
    {
      id: 'mute',
      icon: <MuteIcon />,
      text: 'Mute',
      onPress: handleMutePress,
    },
    // Conditionally show Follow or Unfollow based on isFollowingUser (only for other users' posts)
    ...(!isOwnPost ? (isFollowingUser
      ? [
          {
            id: 'unfollow',
            icon: <UnfollowIcon />,
            text: 'Unfollow',
            onPress: handleUnfollowPress,
          },
        ]
      : [
          {
            id: 'follow',
            icon: <Ionicons name="person-add-outline" size={24} color="#AF7DFF" />,
            text: 'Follow',
            onPress: handleFollowPress,
          },
        ]) : []),
    // Show delete option only for own posts
    ...(isOwnPost
      ? [
          {
            id: 'delete',
            icon: <Ionicons name="trash-outline" size={24} color="#FF3B30" />,
            text: 'Delete',
            onPress: handleDeletePress,
            isDanger: true,
          },
        ]
      : [
          {
            id: 'report',
            icon: <ReportIcon />,
            text: 'Report',
            onPress: () => {
              setShowOptionsModal(false);
              setShowReportDrawer(true);
            },
            isDanger: true,
          },
        ]),
  ];

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
            onPress={() => router.push('/post/create')}
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

      {/* Post Image */}
      {post.imageUrl ? (
        <>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowImageViewer(true)}
            style={styles.postImageContainer}
          >
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Fullscreen Image Viewer */}
          <Modal
            visible={showImageViewer}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowImageViewer(false)}
          >
            <Pressable
              style={styles.imageViewerOverlay}
              onPress={() => setShowImageViewer(false)}
            >
              <View style={styles.imageViewerContent}>
                <Image
                  source={{ uri: post.imageUrl }}
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                />
                <Pressable
                  style={styles.imageViewerCloseButton}
                  onPress={() => setShowImageViewer(false)}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </>
      ) : null}

      {/* Post Content */}
      {contentWithoutHashtags ? (
        <Text style={styles.postContent}>{contentWithoutHashtags}</Text>
      ) : null}

      {/* Poll Options */}
      {isPoll && post.pollOptions && (
        <View style={styles.pollContainer}>
          {post.pollOptions.map((option, index) => {
            const percentage = pollPercentages[index] || 0;
            const maxPercentage = Math.max(...pollPercentages);
            const isWinning = hasPollVotes && percentage === maxPercentage && percentage > 0;
            const isSelected = userVote === index;

            const handleVote = () => {
              if (hasUserVoted) {
                // User already voted, don't allow changing vote
                return;
              }
              
              // Update local state immediately for better UX
              const newVotes = [...localPollVotes];
              if (newVotes.length <= index) {
                // Initialize array if needed
                while (newVotes.length <= index) {
                  newVotes.push(0);
                }
              }
              newVotes[index] = (newVotes[index] || 0) + 1;
              setLocalPollVotes(newVotes);
              setUserVote(index);
              
              // Call the parent handler
              onVote?.(post.id, index);
            };

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pollOption,
                  !hasPollVotes && styles.pollOptionNoVotes,
                  hasPollVotes && !isWinning && styles.pollOptionWithVotes,
                  isWinning && styles.pollOptionWinning,
                  isSelected && !hasPollVotes && styles.pollOptionSelected,
                ]}
                onPress={handleVote}
                disabled={hasUserVoted}
                activeOpacity={hasUserVoted ? 1 : 0.7}
              >
                {/* Progress Bar Background - Only show if votes exist */}
                {hasPollVotes && (
                  <View style={[
                    styles.pollProgressContainer,
                    isWinning && styles.pollProgressContainerWinning,
                  ]}>
                    <View
                      style={[
                        styles.pollProgressBar,
                        { width: `${percentage}%` },
                        isWinning ? styles.pollProgressBarWinning : styles.pollProgressBarNormal,
                      ]}
                    />
                  </View>
                )}

                {/* Poll Option Content */}
                <View style={styles.pollOptionContent}>
                  <View style={styles.pollOptionRow}>
                    <Text
                      style={[
                        styles.pollOptionText,
                        !hasPollVotes && styles.pollOptionTextNoVotes,
                        hasPollVotes && !isWinning && styles.pollOptionTextWithVotes,
                        isWinning && styles.pollOptionTextWinning,
                      ]}
                    >
                      {option}
                    </Text>
                    {hasPollVotes && (
                      <Text
                        style={[
                          styles.pollPercentage,
                          !isWinning && styles.pollPercentageWithVotes,
                          isWinning && styles.pollPercentageWinning,
                        ]}
                      >
                        {percentage}%
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
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
          onPress={() => {
            const wasLiked = localIsLiked;
            setLocalIsLiked(!localIsLiked);
            if (wasLiked) {
              setLikeCount(prev => Math.max(0, prev - 1));
            } else {
              setLikeCount(prev => prev + 1);
            }
            onLike?.(post.id);
          }}
        >
          <View style={styles.actionButtonIcon}>
          {localIsLiked ? (
            <LikedIcon width={18} height={18} color="#AF7DFF" />
            ) : (
              <LikeIcon width={18} height={18} color="#4E4C57" />
            )}
          </View>
          <Text style={[styles.actionText, localIsLiked && styles.actionTextLiked]}>
            {formatNumber(likeCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            const wasCommented = isCommented;
            setIsCommented(!isCommented);
            if (wasCommented) {
              setCommentCount(prev => Math.max(0, prev - 1));
            } else {
              setCommentCount(prev => prev + 1);
            }
            onComment?.(post.id);
          }}
        >
          <View style={styles.actionButtonIcon}>
          {isCommented ? (
            <CommentedIcon width={18} height={18} color="#AF7DFF" />
          ) : (
            <CommentIcon width={18} height={18} color="#4E4C57" />
            )}
          </View>
          <Text style={[styles.actionText, isCommented && styles.actionTextPurple]}>
            {formatNumber(commentCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            const wasShared = isShared;
            setIsShared(!isShared);
            if (wasShared) {
              setShareCount(prev => Math.max(0, prev - 1));
            } else {
              setShareCount(prev => prev + 1);
            }
            onShare?.(post.id);
          }}
        >
          <View style={styles.actionButtonIcon}>
          {isShared ? (
            <SharedIcon width={18} height={18} color="#AF7DFF" />
          ) : (
            <ShareIcon width={18} height={18} color="#4E4C57" />
          )}
          </View>
          <Text style={[styles.actionText, isShared && styles.actionTextPurple]}>
            {formatNumber(shareCount)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Options Drawer */}
      <OptionsDrawer
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        options={postOptions}
        iconColor="#AF7DFF"
        iconSize={24}
      />

      {/* Report Drawer */}
      <ReportDrawer
        visible={showReportDrawer}
        onClose={() => setShowReportDrawer(false)}
        onReportReasonSelected={(reason) => {
          console.log('Report reason selected:', reason, 'for post:', post.id);
          onReport?.(post.id);
          // You can pass the reason to the onReport callback if needed
        }}
        userName={post.userId.name}
        onBlock={() => {
          // TODO: Implement block functionality
          console.log('Block user:', post.userId.name);
        }}
        onRestrict={() => {
          // TODO: Implement restrict functionality
          console.log('Restrict user:', post.userId.name);
        }}
        onUnfollow={() => {
          onUnfollow?.(post.id);
        }}
      />

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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>
              Delete Post?
            </Text>
            
            <Text style={styles.confirmModalDescription}>
              Are you sure you want to delete this post? This action cannot be undone.
            </Text>
            
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: '#FF3B30' }]}
              onPress={handleConfirmDelete}
              activeOpacity={0.8}
              disabled={deletePostMutation.isPending}
            >
              <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>
                {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelDelete}
              activeOpacity={0.8}
              disabled={deletePostMutation.isPending}
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
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  
    fontFamily: 'Montserrat_600SemiBold',
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
    fontFamily: 'Montserrat_600SemiBold',
  },
  postTime: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_600SemiBold',
  },
  menuButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: '#0D0A1B',
    lineHeight: 24,
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  postImageContainer: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  postImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#F5F5F5',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  imageViewerImage: {
    width: '100%',
    height: '80%',
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 60,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollContainer: {
    marginBottom: 12,
    gap: 8,
  },
  pollOption: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
    padding: 12,
    position: 'relative',
    borderWidth: 1,
  },
  pollOptionNoVotes: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  pollOptionWithVotes: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  pollOptionWinning: {
    backgroundColor: '#AF7DFF',
    borderColor: '#AF7DFF',
  },
  pollOptionSelected: {
    borderColor: '#AF7DFF',
    borderWidth: 2,
  },
  pollProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
  },
  pollProgressContainerWinning: {
    backgroundColor: '#AF7DFF',
  },
  pollProgressBar: {
    height: '100%',
    borderRadius: 12,
  },
  pollProgressBarNormal: {
    backgroundColor: '#E0E0E0',
  },
  pollProgressBarWinning: {
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
    fontWeight: '500',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pollOptionTextNoVotes: {
    color: '#0D0A1B',
  },
  pollOptionTextWithVotes: {
    color: '#0D0A1B',
  },
  pollOptionTextWinning: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pollPercentage: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pollPercentageWithVotes: {
    color: '#0D0A1B',
  },
  pollPercentageWinning: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    fontFamily: 'Montserrat_600SemiBold',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonIcon: {
    width: 38,
    height: 38,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#4E4C57',
    fontWeight: '500',
    fontFamily: 'Montserrat_600SemiBold',
  },
  actionTextLiked: {
    color: '#AF7DFF',
  },
  actionTextPurple: {
    color: '#AF7DFF',
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
    fontFamily: 'Montserrat_600SemiBold',
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
    fontFamily: 'Montserrat_600SemiBold',
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

