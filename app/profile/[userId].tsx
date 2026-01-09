import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePosts } from '@/hooks/queries/usePosts';
import Post from '@/components/Post-card';
import { showToast } from '@/utils/toast';
import { Post as PostType } from '@/services/postService';
import * as Clipboard from 'expo-clipboard';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import ShareProfileIcon from '@/components/ui/ShareProfileIcon';
import EditProfileIcon from '@/components/ui/EditProfileIcon';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<'Posts' | 'Events'>('Posts');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch user posts
  const { data, isLoading, error, refetch } = usePosts({
    page: 1,
    limit: 20,
    userId: userId,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      showToast.error('Failed to refresh posts');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
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

  // Get user info from first post or use defaults
  const userInfo = data?.posts[0]?.userId || {
    _id: userId || '',
    name: 'User',
    email: 'user@example.com',
    picture: undefined,
  };

  const username = userInfo.email
    ? `@${userInfo.email.split('@')[0]}`
    : '@user';

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
            <View style={styles.topNavLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Profile</Text>  
          </View>
          <View style={styles.navRight}>
              <TouchableOpacity 
              style={styles.navIconButton}
              onPress={() => router.push('/profile/edit-profile' as any)}
            >
                     <EditProfileIcon width={40} height={40} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navIconButton}>
                     <ShareProfileIcon width={40} height={40} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#AF7DFF"
            />
          }
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileHeaderTop}>
              <View style={styles.profileHeaderLeft}>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{userInfo.name}</Text>
                    <View style={styles.verifiedBadge}>
                      <VerifiedBadge width={16} height={16} color="#7436D7" />
                    </View>
                  </View>
                  <Text style={styles.userHandle}>{username}</Text>
                  
                  {/* Role & Education Section */}
                  <View style={styles.roleEducationSection}>
                    <Text style={styles.roleEducationText}>
                      Senior UX Designer · Adobe Inc. | University of California
                    </Text>
                    <Text style={styles.locationText}>New Jersey, USA</Text>
                  </View>

                  <View style={styles.planRow}>
                    <Ionicons name="sparkles" size={16} color="#AF7DFF" />
                    <Text style={styles.planText}>Basic Plan</Text>
                    <TouchableOpacity>
                      <Text style={styles.upgradeText}>Upgrade</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.profileImageContainer}>
                {userInfo.picture ? (
                  <Image
                    source={{ uri: userInfo.picture }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>
                      {getInitials(userInfo.name)}
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
            </View>

            {/* Followers/Following Cards */}
            <View style={styles.statsContainer}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push(`/profile/followers-following?type=followers` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="people-outline" size={20} color="#AF7DFF" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Followers</Text>
                  <Text style={styles.statValue}>5.7k</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push(`/profile/followers-following?type=following` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#AF7DFF" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Following</Text>
                  <Text style={styles.statValue}>2.1k</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* About Me Section */}
            <View style={styles.aboutSection}>
              <View style={styles.aboutHeader}>
                <Text style={styles.aboutTitle}>About Me</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(true)}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.aboutText}>
                I love connecting with 👯people and sharing 💡ideas. Big fan of creativity, good coffee, and late-night brainstorming. Here to learn, create, and have fun doing it.
              </Text>
            </View>

            {/* Education & Role Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="menu" size={16} color="#AF7DFF" />
                </View>
                <Text style={styles.sectionTitle}>Education & Role</Text>
              </View>
              <View style={styles.educationContent}>
                <Text style={styles.educationText}>
                  B.Sc. Computer Science • University of California{'\n'}New Jersey, USA
                </Text>
                <TouchableOpacity>
                  <Text style={styles.moreText}>+2 more</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Skills & Interests Section */}
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
                    <View style={styles.skillTag}>
                      <Text style={styles.skillText}>👥 Community</Text>
                    </View>
                    <View style={styles.skillTag}>
                      <Text style={styles.skillText}>🎨 Design</Text>
                    </View>
                    <View style={styles.skillTag}>
                      <Text style={styles.skillText}>🧵 Craft</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.moreText}>+3 more</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Content Tabs */}
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

          {/* Posts Feed */}
          {activeTab === 'Posts' && (
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
                      isLiked={likedPosts.has(post.id)}
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

          {activeTab === 'Events' && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events yet</Text>
            </View>
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
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>About Me</Text>
                <Text style={styles.modalAboutText}>
                  I love connecting with 👯people and sharing 💡ideas. Big fan of creativity, good coffee, and late-night brainstorming. Here to learn, create, and have fun doing it.
                </Text>
              </View>

              {/* Education & Role Section */}
              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <View style={styles.modalSectionIconContainer}>
                    <Ionicons name="menu" size={16} color="#AF7DFF" />
                  </View>
                  <Text style={styles.modalSectionTitle}>Education & Role</Text>
                </View>
                
                {/* Education Entry */}
                <View style={styles.modalListItem}>
                  <Text style={styles.modalListItemText}>
                    B.Sc. Computer Science • University of California
                  </Text>
                  <Text style={styles.modalListItemSubtext}>2014</Text>
                </View>
                <View style={styles.modalDivider} />

                {/* Role Entry 1 */}
                <View style={styles.modalListItem}>
                  <Text style={styles.modalListItemText}>
                    Senior UX Designer • Adobe Inc
                  </Text>
                  <Text style={styles.modalListItemSubtext}>New Jersey, USA</Text>
                  <Text style={styles.modalCurrentWorking}>Currently Working here</Text>
                </View>
                <View style={styles.modalDivider} />

                {/* Role Entry 2 */}
                <View style={styles.modalListItem}>
                  <Text style={styles.modalListItemText}>
                    Lead Product Designer • Airbnb
                  </Text>
                  <Text style={styles.modalListItemSubtext}>
                    From 2016 - 2018 | New Jersey, USA
                  </Text>
                </View>
              </View>

              {/* Skills & Interests Section */}
              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <View style={styles.modalSectionIconContainer}>
                    <Ionicons name="sparkles" size={16} color="#AF7DFF" />
                  </View>
                  <Text style={styles.modalSectionTitle}>Skills & Interests</Text>
                </View>
                
                <View style={styles.modalSkillsContainer}>
                  <View style={styles.modalSkillTag}>
                    <Ionicons name="people" size={14} color="#FFFFFF" />
                    <Text style={styles.modalSkillText}>Community</Text>
                  </View>
                  <View style={styles.modalSkillTag}>
                    <Ionicons name="color-palette" size={14} color="#FFFFFF" />
                    <Text style={styles.modalSkillText}>Design</Text>
                  </View>
                  <View style={styles.modalSkillTag}>
                    <Ionicons name="construct" size={14} color="#FFFFFF" />
                    <Text style={styles.modalSkillText}>Craft</Text>
                  </View>
                  <View style={styles.modalSkillTag}>
                    <Ionicons name="game-controller" size={14} color="#FFFFFF" />
                    <Text style={styles.modalSkillText}>Chess</Text>
                  </View>
                  <View style={styles.modalSkillTag}>
                    <Ionicons name="barbell" size={14} color="#FFFFFF" />
                    <Text style={styles.modalSkillText}>Fitness/Gym</Text>
                  </View>
                  <View style={styles.modalSkillTag}>
                    <Ionicons name="brush" size={14} color="#FFFFFF" />
                    <Text style={styles.modalSkillText}>Artist/Creator</Text>
                  </View>
                </View>
              </View>
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
    padding: 4,
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
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  emptyText: {
    fontSize: 14,
    color: '#4E4C57',
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
});

