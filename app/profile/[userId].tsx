import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl, Modal, Pressable, Switch, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePosts, useToggleLike } from '@/hooks/queries/usePosts';
import Post from '@/components/Post-card';
import { showToast } from '@/utils/toast';
import { Post as PostType } from '@/services/postService';
import { User, EducationEntry, RoleEntry } from '@/services/authService';
import * as Clipboard from 'expo-clipboard';
import { uploadImage } from '@/services/uploadService';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import ShareProfileIcon from '@/components/ui/ShareProfileIcon';
import EditProfileIcon from '@/components/ui/EditProfileIcon';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';
import { useUser, useUserById, useFollowUser, useUnfollowUser, useUpdatePersonalInfo } from '@/hooks/queries/useAuth';
import NotificationIcon from '@/components/ui/NotificationIcon';
import CalendarIcon from '@/assets/icons/calendar.svg';
import { useEvents } from '@/hooks/queries/useEvents';
import Event, { EventType } from '@/components/Event-card';
import { Event as BackendEvent } from '@/services/eventService';
import ShareIcon from '@/assets/icons/Share.svg';
import LockIcon from '@/assets/icons/lock.svg';
import GlobeIcon from '@/assets/icons/global.svg';
import NotificationOnIcon from '@/assets/icons/notification-on.svg';
import ViewProfileIcon from '@/assets/icons/view-profile.svg';
import MuteIcon from '@/assets/icons/mute.svg';
import UnfollowIcon from '@/assets/icons/unfollow.svg';
import BlockIcon from '@/assets/icons/block-user.svg';
import ReportIcon from '@/assets/icons/report.svg';
import CopyLinkIcon from '@/assets/icons/copy-link.svg';
import OptionsDrawer, { OptionItem } from '@/components/OptionsDrawer';
import { skillCategories } from '@/constants/skills';

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const currentUser = useUser();
  const isOwnProfile = currentUser?.id === userId;
  const [activeTab, setActiveTab] = useState<'Posts' | 'Events'>('Posts');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [profileNotificationsEnabled, setProfileNotificationsEnabled] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [showAboutProfileModal, setShowAboutProfileModal] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [showSkillsInterestsModal, setShowSkillsInterestsModal] = useState(false);
  const [showAllEducationsRolesModal, setShowAllEducationsRolesModal] = useState(false);

  // Fetch user profile data
  const { 
    data: userData, 
    isLoading: isLoadingUser, 
    error: userError,
    refetch: refetchUser 
  } = useUserById(userId);

  // Fetch user posts
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = usePosts({
    page: 1,
    limit: 20,
    userId: userId,
  });

  // Fetch user events
  const { 
    data: eventsData, 
    isLoading: isLoadingEvents, 
    error: eventsError, 
    refetch: refetchEvents,
    isRefetching: isRefetchingEvents 
  } = useEvents({
    page: 1,
    limit: 50,
    userId: userId,
  });

  // Like/unlike mutation
  const toggleLikeMutation = useToggleLike();
  
  // Follow/unfollow mutations
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();
  
  // Update personal info mutation
  const updatePersonalInfoMutation = useUpdatePersonalInfo();

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchUser(), refetch(), refetchEvents()]);
    } catch (error) {
      showToast.error('Failed to refresh');
    }
  };

  const toggleLike = (postId: string) => {
    toggleLikeMutation.mutate(postId, {
      onError: (error: any) => {
        showToast.error(error.message || 'Failed to update like');
      },
    });
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleMenuPress = (postId: string) => {
    console.log('Menu pressed for post:', postId);
  };

  const handleSave = (postId: string, post?: PostType) => {
    showToast.saved(() => {
      console.log('Navigate to saved posts');
    });
    console.log('Save post:', postId);
  };

  const handleNotInterested = (postId: string) => {
    showToast.info('We\'ll show you less like this');
    console.log('Not interested in post:', postId);
  };

  const handleCopyLink = async (postId: string) => {
    try {
      const postLink = `https://kalon.app/post/${postId}`;
      await Clipboard.setStringAsync(postLink);
      showToast.linkCopied();
      console.log('Copy link for post:', postId);
    } catch (error) {
      showToast.error('Failed to copy link');
      console.error('Error copying link:', error);
    }
  };

  const handleNotify = (postId: string, post?: PostType) => {
    const userName = post?.userId?.name || 'this user';
    showToast.notify(userName, () => {
      console.log('Navigate to notification settings');
    });
    console.log('Notify for post:', postId);
  };

  const handleMute = (postId: string) => {
    showToast.info('Post muted');
    console.log('Mute post:', postId);
  };

  const handleUnfollow = (postId: string) => {
    showToast.info('Unfollowed user');
    console.log('Unfollow user from post:', postId);
  };

  const handleReport = (postId: string) => {
    showToast.error('Post reported');
    console.log('Report post:', postId);
  };

  // Always use userData from useUserById when available (for both own and other profiles)
  // This ensures we get the latest data including education and roles
  // Fallback to currentUser only if userData is not loaded yet and it's own profile
  const userInfo = userData || (isOwnProfile ? currentUser : null);
  
  // Fallback to defaults if user data is not available
  const displayUser = userInfo || {
    id: userId || '',
    name: 'User',
    email: 'user@example.com',
    picture: undefined,
  };

  // Check if profile is private and user is not a friend
  // When networkVisibility is 'friends', the account is private and only friends (mutual followers) can see the full profile
  const isPrivateProfile = !isOwnProfile && 
    userData?.networkVisibility === 'friends' && 
    !(userData?.isFriend || false);


  const username = displayUser.email
    ? `@${displayUser.email.split('@')[0]}`
    : '@user';

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get skill display name from ID
  const getSkillDisplayName = (skillId: string): string => {
    for (const category of skillCategories) {
      const skill = category.items.find(item => item.id === skillId);
      if (skill) return skill.name;
    }
    // If not found, return the ID as fallback (capitalize first letter)
    return skillId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to format time range
  const formatTimeRange = (startDateTime: string, endDateTime: string): string => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    
    const startTime = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const endTime = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${startTime} – ${endTime}`;
  };

  // Map backend event to frontend EventType
  const mapEventToEventType = (event: BackendEvent, currentUserId?: string): EventType => {
    return {
      id: event.id,
      title: event.eventName,
      host: event.hostBy,
      date: formatDate(event.startDateTime),
      time: formatTimeRange(event.startDateTime, event.endDateTime),
      location: event.eventMode === 'Offline' ? event.location : undefined,
      imageUri: event.thumbnailUri,
      joinedCount: event.attendees,
      isOnline: event.eventMode === 'Online',
      isPublic: event.eventType === 'Public',
      isJoined: event.isJoined || false,
    };
  };

  // Map events for display
  const mappedEvents = useMemo(() => {
    if (!eventsData?.events) return [];
    return eventsData.events.map(event => mapEventToEventType(event, currentUser?.id));
  }, [eventsData?.events, currentUser?.id]);

  const handleEventJoin = (eventId: string) => {
    console.log('Join event:', eventId);
  };

  const handleEventShare = (eventId: string) => {
    console.log('Share event:', eventId);
  };

  const handleEventSave = (eventId: string) => {
    console.log('Save event:', eventId);
  };

  // Show loading state while fetching user data
  if (isLoadingUser && !userInfo) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.content} edges={['top']}>
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#AF7DFF" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleFollowToggle = () => {
    if (!userId || !userData) return;
    
    const currentlyFollowing = userData.isFollowing || false;
    
    if (currentlyFollowing) {
      // Unfollow
      unfollowUserMutation.mutate(userId, {
        onSuccess: () => {
          showToast.success('Unfollowed');
          refetchUser(); // Refresh user data to update isFollowing and counts
        },
        onError: (error: any) => {
          showToast.error(error.message || 'Failed to unfollow user');
        },
      });
    } else {
      // Follow
      followUserMutation.mutate(userId, {
        onSuccess: () => {
          showToast.success('Following');
          refetchUser(); // Refresh user data to update isFollowing and counts
        },
        onError: (error: any) => {
          showToast.error(error.message || 'Failed to follow user');
        },
      });
    }
  };

  const handleMessage = () => {
    // Navigate to chat with this user
    router.push(`/chats/${userId}` as any);
  };

  // Handle profile image upload
  const handleUploadProfileImage = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Show loading toast
        showToast.info('Uploading image...');
        
        try {
          // Upload image to S3
          const uploadResponse = await uploadImage(imageUri, 'profiles');
          
          // Update user profile with the new image URL
          updatePersonalInfoMutation.mutate(
            { picture: uploadResponse.imageUrl },
            {
              onSuccess: () => {
                showToast.success('Profile image updated successfully');
                // Refresh user data
                refetchUser();
              },
              onError: (error: any) => {
                showToast.error(error.message || 'Failed to update profile image');
              },
            }
          );
        } catch (uploadError: any) {
          showToast.error(uploadError.message || 'Failed to upload image');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast.error('Failed to select image');
    }
  };

  // Handle native share
  const handleNativeShare = async () => {
    try {
      const profileLink = `https://www.kalon.net/${username}`;
      const result = await Share.share({
        message: `Check out ${displayUser.name}'s profile on Kalon: ${profileLink}`,
        url: profileLink,
        title: `${displayUser.name}'s Profile`,
      });
      
      if (result.action === Share.sharedAction) {
        setShowShareDrawer(false);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Build options array for the drawer
  const profileOptions: OptionItem[] = [
    {
      id: 'copy-link',
      icon: <CopyLinkIcon />,
      text: 'Copy link',
      onPress: handleNativeShare,
    },
    {
      id: 'about-profile',
      icon: <ViewProfileIcon />,
      text: 'About this profile',
      onPress: () => setShowAboutProfileModal(true),
    },
    {
      id: 'mute',
      icon: <MuteIcon />,
      text: 'Mute',
      onPress: () => showToast.info('Profile muted'),
    },
    {
      id: 'unfollow',
      icon: <UnfollowIcon />,
      text: 'Unfollow',
      onPress: () => {
        if (!userId || !userData) return;
        unfollowUserMutation.mutate(userId, {
          onSuccess: () => {
            showToast.success('Unfollowed user');
            refetchUser();
          },
          onError: (error: any) => {
            showToast.error(error.message || 'Failed to unfollow user');
          },
        });
      },
    },
    {
      id: 'block',
      icon: <BlockIcon />,
      text: 'Block',
      onPress: () => showToast.error('User blocked'),
      isDanger: true,
    },
    {
      id: 'report',
      icon: <ReportIcon />,
      text: 'Report',
      onPress: () => showToast.error('Profile reported'),
      isDanger: true,
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
          <View style={styles.topNavLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </TouchableOpacity>
            {isOwnProfile && <Text style={styles.navTitle}>Profile</Text>}
          </View>
          <View style={styles.navRight}>
            {isOwnProfile ? (
              <>
                <TouchableOpacity 
                  style={styles.navIconButton}
                  onPress={() => router.push('/profile/edit-profile' as any)}
                >
                  <EditProfileIcon width={40} height={40} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navIconButton}>
                  <ShareProfileIcon width={40} height={40} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.navIconButton}>
                  <GlobeIcon width={24} height={24} color="#0D0A1B" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.navIconButton}
                  onPress={() => setShowNotificationModal(true)}
                >
                  {profileNotificationsEnabled ? (
                    <NotificationOnIcon width={24} height={24} />
                  ) : (
                    <NotificationIcon width={24} height={24} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.navIconButton}
                  onPress={() => setShowOptionsDrawer(true)}
                >
                  <Ionicons name="ellipsis-horizontal" size={24} color="#0D0A1B" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

          <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching || isRefetchingEvents || (isLoadingUser && !!userInfo)}
              onRefresh={handleRefresh}
              tintColor="#AF7DFF"
            />
          }
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.profileHeaderTop, !isOwnProfile && styles.profileHeaderTopCompact]}>
              <View style={styles.profileHeaderLeft}>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{displayUser.name || 'User'}</Text>
                    <View style={styles.verifiedBadge}>
                      <VerifiedBadge width={16} height={16} color="#7436D7" />
                    </View>
                  </View>
                  <Text style={[styles.userHandle, !isOwnProfile && styles.userHandleCompact]}>{username}</Text>
                  
                  {/* Role & Education Section - Only show for own profile */}
                  {isOwnProfile && (displayUser.roles?.length > 0 || displayUser.educations?.length > 0) && (
                    <View style={styles.roleEducationSection}>
                      <Text style={styles.roleEducationText}>
                        {displayUser.roles?.[0]?.currentRole && displayUser.roles[0]?.companyOrganisation 
                          ? `${displayUser.roles[0].currentRole} · ${displayUser.roles[0].companyOrganisation}`
                          : ''}
                        {displayUser.educations?.[0]?.schoolUniversity 
                          ? `${displayUser.roles?.[0]?.currentRole ? ' | ' : ''}${displayUser.educations[0].schoolUniversity}`
                          : ''}
                      </Text>
                      {displayUser.roles?.[0]?.location && (
                        <Text style={styles.locationText}>{displayUser.roles[0].location}</Text>
                      )}
                    </View>
                  )}

                  {/* Plan Section - Only show for own profile */}
                  {isOwnProfile && (
                    <View style={styles.planRow}>
                      <Ionicons name="sparkles" size={16} color="#AF7DFF" />
                      <Text style={styles.planText}>Basic Plan</Text>
                      <TouchableOpacity>
                        <Text style={styles.upgradeText}>Upgrade</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Followers count - Show for others profile */}
                  {!isOwnProfile && userData && (
                    <Text style={styles.followersCountText}>
                      {userData.followersCount || 0} {userData.followersCount === 1 ? 'Follower' : 'Followers'}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.profileImageContainer}>
                {displayUser.picture ? (
                  <Image
                    source={{ uri: displayUser.picture }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>
                      {getInitials(displayUser.name || 'User')}
                    </Text>
                  </View>
                )}
                {/* Add icon badge - Only show for own profile */}
                {isOwnProfile && (
                  <TouchableOpacity 
                    style={styles.addIconBadge}
                    onPress={handleUploadProfileImage}
                    activeOpacity={0.7}
                    disabled={updatePersonalInfoMutation.isPending}
                  >
                    {updatePersonalInfoMutation.isPending ? (
                      <ActivityIndicator size="small" color="#AF7DFF" />
                    ) : (
                      <Ionicons name="add" size={12} color="#AF7DFF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Action Buttons - Show for others profile */}
            {!isOwnProfile && (
              <View style={styles.actionButtonsContainer}>
                <View style={styles.actionButtonsContainerLeft}>
                <TouchableOpacity
                  style={[
                    styles.actionButton, 
                    styles.followingButton, 
                    (userData?.isFollowing || false) && styles.followingButtonActive
                  ]}
                  onPress={handleFollowToggle}
                  activeOpacity={0.7}
                  disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                >
                  {(followUserMutation.isPending || unfollowUserMutation.isPending) ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.actionButtonText, styles.followingButtonText]}>
                      {(userData?.isFollowing || false) ? 'Following' : 'Follow'}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={handleMessage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
                </View>
                <View style={styles.actionButtonsContainerRight}>
                <TouchableOpacity
                  style={styles.shareButtonCircle}
                  activeOpacity={0.7}
                >
                  <ShareIcon width={18} height={18} color="#AF7DFF" />
                </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Followers/Following Cards - Only show for own profile */}
            {isOwnProfile && (
            <View style={styles.statsContainer}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push(`/profile/followers-following?type=followers&userId=${userId}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="people-outline" size={20} color="#AF7DFF" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Followers</Text>
                  <Text style={styles.statValue}>
                    {userData?.followersCount ? 
                      userData.followersCount >= 1000 
                        ? `${(userData.followersCount / 1000).toFixed(1)}k` 
                        : userData.followersCount.toString()
                      : '0'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push(`/profile/followers-following?type=following&userId=${userId}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#AF7DFF" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Following</Text>
                  <Text style={styles.statValue}>
                    {userData?.followingCount ? 
                      userData.followingCount >= 1000 
                        ? `${(userData.followingCount / 1000).toFixed(1)}k` 
                        : userData.followingCount.toString()
                      : '0'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            )}

            {/* About Me Section */}
            {displayUser.aboutMe && (
              <View style={styles.aboutSection}>
                <View style={styles.aboutHeader}>
                  <Text style={styles.aboutTitle}>About Me</Text>
                  {isOwnProfile && (
                  <TouchableOpacity onPress={() => setShowDetailsModal(true)}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.aboutText}>
                  {displayUser.aboutMe}
                </Text>
              </View>
            )}

            {/* Private Account Section */}
            {isPrivateProfile && (
              <View style={styles.privateAccountSection}>
                <View style={styles.privateAccountIconContainer}>
                  <LockIcon width={32} height={32} color="#AF7DFF" />
                </View>
                <View style={styles.privateAccountTextContainer}>
                  <Text style={styles.privateAccountTitle}>This account is private</Text>
                  <Text style={styles.privateAccountDescription}>
                    Follow this account to see their posts and events.
                  </Text>
                </View>
              </View>
            )}

            {/* Education & Role Section - Only show for own profile */}
            {isOwnProfile && (displayUser.educations?.length > 0 || displayUser.roles?.length > 0) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="menu" size={16} color="#AF7DFF" />
                  </View>
                  <Text style={styles.sectionTitle}>Education & Role</Text>
                </View>
                <View style={styles.educationContent}>
                  {displayUser.educations?.[0] && (
                    <Text style={styles.educationText}>
                      {displayUser.educations[0].degreeProgram} • {displayUser.educations[0].schoolUniversity}
                      {displayUser.educations[0].startYear && `\n${displayUser.educations[0].startYear}${displayUser.educations[0].endYear ? ` - ${displayUser.educations[0].endYear}` : displayUser.educations[0].currentlyEnrolled ? ' - Present' : ''}`}
                    </Text>
                  )}
                  {displayUser.roles?.[0] && (
                    <Text style={styles.educationText}>
                      {displayUser.roles[0].currentRole} • {displayUser.roles[0].companyOrganisation}
                      {displayUser.roles[0].location && `\n${displayUser.roles[0].location}`}
                    </Text>
                  )}
                  {(displayUser.educations?.length > 1 || displayUser.roles?.length > 1) && (
                    <TouchableOpacity onPress={() => setShowSkillsInterestsModal(true)} activeOpacity={0.7}>
                      <Text style={styles.moreText}>
                        +{((displayUser.educations?.length || 0) + (displayUser.roles?.length || 0) - 2)} more
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Skills & Interests Section - Only show for own profile */}
            {isOwnProfile && displayUser.skills && displayUser.skills.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="sparkles" size={16} color="#AF7DFF" />
                  </View>
                  <Text style={styles.sectionTitle}>Skills & Interests</Text>
                </View>
                <View style={styles.skillsContainer}>
                  <View style={styles.skillsRow}>
                    <View style={styles.skillsTagsContainer}>
                      {displayUser.skills.slice(0, 3).map((skill: string, index: number) => (
                        <View key={index} style={styles.skillTag}>
                          <Text style={styles.skillText}>{getSkillDisplayName(skill)}</Text>
                        </View>
                      ))}
                    </View>
                    {displayUser.skills.length > 3 && (
                      <TouchableOpacity onPress={() => setShowSkillsInterestsModal(true)} activeOpacity={0.7}>
                        <Text style={styles.moreText}>+{displayUser.skills.length - 3} more</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Content Tabs - Hide if private profile and not following */}
          {!isPrivateProfile && (
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'Posts' && styles.tabActive]}
                onPress={() => setActiveTab('Posts')}
              >
                <Text style={[styles.tabText, activeTab === 'Posts' && styles.tabTextActive]}>
                  Posts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'Events' && styles.tabActive]}
                onPress={() => setActiveTab('Events')}
              >
                <Text style={[styles.tabText, activeTab === 'Events' && styles.tabTextActive]}>
                  Events
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Posts Feed */}
          {!isPrivateProfile && activeTab === 'Posts' && (
            <>
              {isLoading && !data ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#AF7DFF" />
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Failed to load posts</Text>
                </View>
              ) : (
                <>
                  {data?.posts.map((post) => (
                    <Post
                      key={post.id}
                      post={post}
                      isLiked={post.isLiked || false}
                      onLike={toggleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onMenuPress={handleMenuPress}
                      onSave={handleSave}
                      onNotInterested={handleNotInterested}
                      onCopyLink={handleCopyLink}
                      onNotify={handleNotify}
                      onMute={handleMute}
                      onUnfollow={handleUnfollow}
                      onReport={handleReport}
                    />
                  ))}
                  {data?.posts.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No posts yet</Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* Events Feed */}
          {!isPrivateProfile && activeTab === 'Events' && (
            <>
              {isLoadingEvents && !eventsData ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#AF7DFF" />
                </View>
              ) : eventsError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Failed to load events</Text>
                </View>
              ) : (
                <>
                  {mappedEvents.length === 0 ? (
                    <View style={styles.emptyEventsContainer}>
                      <View style={styles.emptyEventsIconContainer}>
                        <View style={styles.emptyEventsIconCircle}>
                          <CalendarIcon width={32} height={32} color="#AF7DFF" />
                        </View>
                      </View>
                      <Text style={styles.emptyEventsTitle}>No Events</Text>
                      <Text style={styles.emptyEventsDescription}>
                        {isOwnProfile 
                          ? "You haven't shared any events." 
                          : "This user hasn't shared any events."}
                      </Text>
                    </View>
                  ) : (
                    mappedEvents.map((event) => (
                      <Event
                        key={event.id}
                        event={event}
                        onJoin={handleEventJoin}
                        onShare={handleEventShare}
                        onSave={handleEventSave}
                      />
                    ))
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* View Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowDetailsModal(false)}
          />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Details</Text>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#0D0A1B" />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Content */}
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* About Me Section */}
              {displayUser.aboutMe && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>About Me</Text>
                  <Text style={styles.modalAboutText}>
                    {displayUser.aboutMe}
                  </Text>
                </View>
              )}

              {/* Education & Role Section */}
              {(displayUser.educations?.length > 0 || displayUser.roles?.length > 0) && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <View style={styles.modalSectionIconContainer}>
                      <Ionicons name="menu" size={16} color="#AF7DFF" />
                    </View>
                    <Text style={styles.modalSectionTitle}>Education & Role</Text>
                  </View>
                  
                  {/* Education Entries */}
                  {displayUser.educations?.map((edu: EducationEntry, index: number) => (
                    <View key={`edu-${index}`}>
                      <View style={styles.modalListItem}>
                        <Text style={styles.modalListItemText}>
                          {edu.degreeProgram} • {edu.schoolUniversity}
                        </Text>
                        <Text style={styles.modalListItemSubtext}>
                          {edu.startYear}{edu.endYear ? ` - ${edu.endYear}` : edu.currentlyEnrolled ? ' - Present' : ''}
                        </Text>
                        {edu.currentlyEnrolled && (
                          <Text style={styles.modalCurrentWorking}>Currently Enrolled</Text>
                        )}
                      </View>
                      {index < (displayUser.educations?.length || 0) - 1 && <View style={styles.modalDivider} />}
                    </View>
                  ))}

                  {/* Role Entries */}
                  {displayUser.roles?.map((role: RoleEntry, index: number) => (
                    <View key={`role-${index}`}>
                      {(displayUser.educations?.length > 0 || index > 0) && <View style={styles.modalDivider} />}
                      <View style={styles.modalListItem}>
                        <Text style={styles.modalListItemText}>
                          {role.currentRole} • {role.companyOrganisation}
                        </Text>
                        {role.location && (
                          <Text style={styles.modalListItemSubtext}>{role.location}</Text>
                        )}
                        {role.startDate && (
                          <Text style={styles.modalListItemSubtext}>
                            {role.endDate 
                              ? `From ${new Date(role.startDate).getFullYear()} - ${new Date(role.endDate).getFullYear()}`
                              : `From ${new Date(role.startDate).getFullYear()} - Present`}
                            {role.location ? ` | ${role.location}` : ''}
                          </Text>
                        )}
                        {role.currentlyWorking && (
                          <Text style={styles.modalCurrentWorking}>Currently Working here</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Skills & Interests Section */}
              {displayUser.skills && displayUser.skills.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <View style={styles.modalSectionIconContainer}>
                      <Ionicons name="sparkles" size={16} color="#AF7DFF" />
                    </View>
                    <Text style={styles.modalSectionTitle}>Skills & Interests</Text>
                  </View>
                  
                  <View style={styles.modalSkillsContainer}>
                    {displayUser.skills.map((skill: string, index: number) => (
                      <View key={index} style={styles.modalSkillTag}>
                        <Text style={styles.modalSkillText}>{getSkillDisplayName(skill)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Notifications Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.notificationModalOverlay}>
          <Pressable
            style={styles.notificationModalBackdrop}
            onPress={() => setShowNotificationModal(false)}
          />
          <View style={styles.notificationModalContent}>
            {/* Drag Handle */}
            <View style={styles.notificationModalDragHandle} />
            
            {/* Modal Header with Toggle */}
            <View style={styles.notificationModalHeader}>
              <View style={styles.notificationModalHeaderLeft}>
                <Text style={styles.notificationModalTitle}>Profile Notifications</Text>
                <Text style={styles.notificationModalDescription}>
                  You'll receive updates when <Text style={styles.notificationModalBoldText}>{username}</Text> posts or takes action.
                </Text>
              </View>
              <Switch
                value={profileNotificationsEnabled}
                onValueChange={setProfileNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: '#AF7DFF' }}
                thumbColor={profileNotificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Options Drawer */}
      <OptionsDrawer
        visible={showOptionsDrawer}
        onClose={() => setShowOptionsDrawer(false)}
        options={profileOptions}
        iconColor="#FFFFFF"
        iconSize={20}
      />

      {/* About This Profile Modal */}
      <Modal
        visible={showAboutProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAboutProfileModal(false)}
      >
        <View style={styles.aboutProfileModalOverlay}>
          <Pressable
            style={styles.aboutProfileModalBackdrop}
            onPress={() => setShowAboutProfileModal(false)}
          />
          <View style={styles.aboutProfileModalContent}>
            {/* Drag Handle */}
            <View style={styles.aboutProfileModalDragHandle} />
            
            {/* Title */}
            <Text style={styles.aboutProfileModalTitle}>About this profile</Text>
            
            {/* User Info Section */}
            <View style={styles.aboutProfileModalUserSection}>
              <View style={styles.aboutProfileModalImageContainer}>
                {displayUser.picture ? (
                  <Image
                    source={{ uri: displayUser.picture }}
                    style={styles.aboutProfileModalImage}
                  />
                ) : (
                  <View style={styles.aboutProfileModalImagePlaceholder}>
                    <Text style={styles.aboutProfileModalImageText}>
                      {getInitials(displayUser.name || 'User')}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.aboutProfileModalUserInfo}>
                <Text style={styles.aboutProfileModalName}>{displayUser.name || 'User'}</Text>
                <Text style={styles.aboutProfileModalUsername}>{username}</Text>
              </View>
            </View>

            {/* Separator */}
            <View style={styles.aboutProfileModalSeparator} />

            {/* Joined Section */}
            {displayUser.createdAt && (
              <View style={styles.aboutProfileModalJoinedSection}>
                <Text style={styles.aboutProfileModalJoinedLabel}>Joined</Text>
                <Text style={styles.aboutProfileModalJoinedDate}>
                  {new Date(displayUser.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Share Drawer */}
      <Modal
        visible={showShareDrawer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareDrawer(false)}
      >
        <View style={styles.shareDrawerOverlay}>
          <Pressable
            style={styles.shareDrawerBackdrop}
            onPress={() => setShowShareDrawer(false)}
          />
          <View style={styles.shareDrawerContent}>
            {/* Header */}
            <View style={styles.shareDrawerHeader}>
              <TouchableOpacity
                style={styles.shareDrawerCloseButton}
                onPress={() => setShowShareDrawer(false)}
              >
                <Ionicons name="close" size={24} color="#0D0A1B" />
              </TouchableOpacity>
            </View>

            {/* User Profile Section */}
            <View style={styles.shareDrawerUserSection}>
              <View style={styles.shareDrawerImageContainer}>
                {displayUser.picture ? (
                  <Image
                    source={{ uri: displayUser.picture }}
                    style={styles.shareDrawerImage}
                  />
                ) : (
                  <View style={styles.shareDrawerImagePlaceholder}>
                    <Text style={styles.shareDrawerImageText}>
                      {getInitials(displayUser.name || 'User')}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.shareDrawerUserInfo}>
                <Text style={styles.shareDrawerUserName}>{displayUser.name || 'User'}</Text>
                <Text style={styles.shareDrawerUrl}>https://www.kalon.net/{username}</Text>
              </View>
            </View>

            {/* Native Share Button */}
            <TouchableOpacity
              style={styles.shareDrawerNativeShareButton}
              onPress={handleNativeShare}
            >
              <View style={styles.shareDrawerNativeShareContent}>
                <Ionicons name="share-outline" size={24} color="#AF7DFF" />
                <Text style={styles.shareDrawerNativeShareText}>
                  Share via...
                </Text>
              </View>
            </TouchableOpacity>

            {/* Copy Link Button */}
            <TouchableOpacity
              style={styles.shareDrawerCopyButton}
              onPress={async () => {
                const profileLink = `https://www.kalon.net/${username}`;
                await Clipboard.setStringAsync(profileLink);
                showToast.linkCopied();
                setShowShareDrawer(false);
              }}
            >
              <Text style={styles.shareDrawerCopyButtonText}>Copy Link</Text>
              <CopyLinkIcon width={20} height={20} color="#AF7DFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Skills & Interests Modal */}
      <Modal
        visible={showSkillsInterestsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSkillsInterestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowSkillsInterestsModal(false)}
          />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Skills & Interests</Text>
              <TouchableOpacity
                onPress={() => setShowSkillsInterestsModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#0D0A1B" />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Content */}
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* Skills Section */}
              {displayUser.skills && displayUser.skills.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <View style={styles.modalSectionIconContainer}>
                      <Ionicons name="sparkles" size={16} color="#AF7DFF" />
                    </View>
                    <Text style={styles.modalSectionTitle}>Skills</Text>
                  </View>
                  
                  <View style={styles.modalSkillsContainer}>
                    {displayUser.skills.map((skill: string, index: number) => (
                      <View key={index} style={styles.modalSkillTag}>
                        <Text style={styles.modalSkillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Goals/Interests Section */}
              {displayUser.goals && displayUser.goals.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <View style={styles.modalSectionIconContainer}>
                      <Ionicons name="flag-outline" size={16} color="#AF7DFF" />
                    </View>
                    <Text style={styles.modalSectionTitle}>Goals & Interests</Text>
                  </View>
                  
                  <View style={styles.modalSkillsContainer}>
                    {displayUser.goals.map((goal: string, index: number) => (
                      <View key={index} style={styles.modalSkillTag}>
                        <Text style={styles.modalSkillText}>{getSkillDisplayName(goal)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Empty State */}
              {(!displayUser.skills || displayUser.skills.length === 0) && 
               (!displayUser.goals || displayUser.goals.length === 0) && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalEmptyText}>No skills or interests added yet.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* All Educations & Roles Modal */}
      <Modal
        visible={showAllEducationsRolesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAllEducationsRolesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowAllEducationsRolesModal(false)}
          />
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Education & Role</Text>
              <TouchableOpacity
                onPress={() => setShowAllEducationsRolesModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#0D0A1B" />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Content */}
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* Education Entries */}
              {displayUser.educations && displayUser.educations.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <View style={styles.modalSectionIconContainer}>
                      <Ionicons name="school-outline" size={16} color="#AF7DFF" />
                    </View>
                    <Text style={styles.modalSectionTitle}>Education</Text>
                  </View>
                  
                  {displayUser.educations.map((edu: EducationEntry, index: number) => (
                    <View key={`edu-${index}`}>
                      <View style={styles.modalListItem}>
                        <Text style={styles.modalListItemText}>
                          {edu.degreeProgram} • {edu.schoolUniversity}
                        </Text>
                        <Text style={styles.modalListItemSubtext}>
                          {edu.startYear}{edu.endYear ? ` - ${edu.endYear}` : edu.currentlyEnrolled ? ' - Present' : ''}
                        </Text>
                        {edu.currentlyEnrolled && (
                          <Text style={styles.modalCurrentWorking}>Currently Enrolled</Text>
                        )}
                      </View>
                      {index < (displayUser.educations?.length || 0) - 1 && <View style={styles.modalDivider} />}
                    </View>
                  ))}
                </View>
              )}

              {/* Role Entries */}
              {displayUser.roles && displayUser.roles.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <View style={styles.modalSectionIconContainer}>
                      <Ionicons name="briefcase-outline" size={16} color="#AF7DFF" />
                    </View>
                    <Text style={styles.modalSectionTitle}>Roles</Text>
                  </View>
                  
                  {displayUser.roles.map((role: RoleEntry, index: number) => (
                    <View key={`role-${index}`}>
                      {index > 0 && <View style={styles.modalDivider} />}
                      <View style={styles.modalListItem}>
                        <Text style={styles.modalListItemText}>
                          {role.currentRole} • {role.companyOrganisation}
                        </Text>
                        {role.location && (
                          <Text style={styles.modalListItemSubtext}>{role.location}</Text>
                        )}
                        {role.startDate && (
                          <Text style={styles.modalListItemSubtext}>
                            {(() => {
                              const startDate = role.startDate.includes('-') 
                                ? role.startDate 
                                : (() => {
                                    const parts = role.startDate.split(' / ');
                                    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : role.startDate;
                                  })();
                              const endDate = role.endDate 
                                ? (role.endDate.includes('-') 
                                    ? role.endDate 
                                    : (() => {
                                        const parts = role.endDate.split(' / ');
                                        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : role.endDate;
                                      })())
                                : null;
                              const startYear = new Date(startDate).getFullYear();
                              const endYear = endDate ? new Date(endDate).getFullYear() : null;
                              return endYear 
                                ? `From ${startYear} - ${endYear}`
                                : `From ${startYear} - Present`;
                            })()}
                            {role.location ? ` | ${role.location}` : ''}
                          </Text>
                        )}
                        {role.currentlyWorking && (
                          <Text style={styles.modalCurrentWorking}>Currently Working here</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Empty State */}
              {(!displayUser.educations || displayUser.educations.length === 0) && 
               (!displayUser.roles || displayUser.roles.length === 0) && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalEmptyText}>No education or role information available.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navIconButton: {
    padding: 6,
    backgroundColor: '#F5EEFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  profileHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileHeaderTopCompact: {
    marginBottom: 16,
  },
  profileHeaderLeft: {
    flex: 1,
    marginRight: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginRight: 6,
    fontFamily: 'Montserrat_700Bold',
  },
  verifiedBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userHandle: {
    fontSize: 14,
    color: '#4E4C57',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  userHandleCompact: {
    marginBottom: 4,
  },
  roleEducationSection: {
    marginBottom: 8,
  },
  roleEducationText: {
    fontSize: 12,
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  locationText: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  upgradeText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  followersCountText: {
    fontSize: 14,
    color: '#4E4C57',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 0,
    marginBottom: 20,
    width: '100%',
  },
  actionButtonsContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionButtonsContainerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 100,
  },
  followingButton: {
    backgroundColor: '#ECECEC',
  },
  followingButtonActive: {
    backgroundColor: '#ECECEC',
  },
  messageButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#AF7DFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  followingButtonText: {
    color: '#4E4C57',
  },
  messageButtonText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  shareButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 24,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5EEFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  aboutText: {
    fontSize: 14,
    color: '#4E4C57',
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  privateAccountSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  privateAccountIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  privateAccountTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  privateAccountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  privateAccountDescription: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  educationContent: {
    marginLeft: 32,
  },
  educationText: {
    fontSize: 14,
    color: '#4E4C57',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  moreText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  skillsContainer: {
    marginLeft: 32,
  },
  skillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  skillsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 9,
    gap: 4,
  },
  skillText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#AF7DFF',
  },
  tabText: {
    fontSize: 16,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  tabTextActive: {
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    height: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontFamily: 'Montserrat_400Regular',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    height: '100%',
  },
  emptyText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  emptyEventsContainer: {
    flex: 1,
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    backgroundColor: '#F5F5F5',
  },
  emptyEventsIconContainer: {
    marginBottom: 24,
  },
  emptyEventsIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEventsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyEventsDescription: {
    fontSize: 14,
    color: '#4E4C57',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalSectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  modalAboutText: {
    fontSize: 14,
    color: '#4E4C57',
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  modalListItem: {
    paddingVertical: 12,
  },
  modalListItemText: {
    fontSize: 14,
    color: '#0D0A1B',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  modalListItemSubtext: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  modalCurrentWorking: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  modalSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#AF7DFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#AF7DFF',
  },
  modalSkillText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#4E4C57',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    paddingVertical: 20,
  },
  // Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  notificationModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  notificationModalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  notificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  notificationModalHeaderLeft: {
    flex: 1,
  },
  notificationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  notificationModalDescription: {
    fontSize: 14,
    color: '#4E4C57',
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  notificationModalBoldText: {
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  // About Profile Modal Styles
  aboutProfileModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  aboutProfileModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  aboutProfileModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  aboutProfileModalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  aboutProfileModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Montserrat_700Bold',
  },
  aboutProfileModalUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutProfileModalImageContainer: {
    marginRight: 16,
  },
  aboutProfileModalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
  },
  aboutProfileModalImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutProfileModalImageText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  aboutProfileModalUserInfo: {
    flex: 1,
  },
  aboutProfileModalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  aboutProfileModalUsername: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  aboutProfileModalSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
  },
  aboutProfileModalJoinedSection: {
    marginBottom: 20,
  },
  aboutProfileModalJoinedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  aboutProfileModalJoinedDate: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  // Share Drawer Styles
  shareDrawerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  shareDrawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  shareDrawerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  shareDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  shareDrawerCloseButton: {
    padding: 4,
  },
  shareDrawerUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  shareDrawerImageContainer: {
    marginRight: 12,
  },
  shareDrawerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
  },
  shareDrawerImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareDrawerImageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  shareDrawerUserInfo: {
    flex: 1,
  },
  shareDrawerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  shareDrawerUrl: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  shareDrawerSection: {
    marginBottom: 24,
  },
  shareDrawerNativeShareButton: {
    backgroundColor: '#F5EEFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  shareDrawerNativeShareContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  shareDrawerNativeShareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  shareDrawerScrollContent: {
    paddingRight: 20,
  },
  shareDrawerContactItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  shareDrawerContactImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  shareDrawerContactImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareDrawerContactInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  shareDrawerContactBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shareDrawerContactName: {
    fontSize: 12,
    color: '#0D0A1B',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  shareDrawerAppItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  shareDrawerAppIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareDrawerAppName: {
    fontSize: 12,
    color: '#0D0A1B',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  shareDrawerCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  shareDrawerCopyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
});

