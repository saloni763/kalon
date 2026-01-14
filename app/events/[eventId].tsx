import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ShareIcon from '@/assets/icons/Share.svg';
import CalendarIcon from '@/components/ui/CalendarIcon';
import BackArrowIcon from '@/components/BackArrowIcon';
import { showToast } from '@/utils/toast';

interface ScheduleItem {
  time: string;
  title: string;
  speaker?: string;
}

interface Speaker {
  id: string;
  name: string;
  imageUri?: string;
}

interface EventDetailType {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  location?: string;
  virtualVenue?: string;
  imageUri?: string;
  videoUri?: string;
  joinedCount: number;
  isOnline: boolean;
  isPublic: boolean;
  tag?: string;
  isJoined?: boolean;
  about?: string;
  photos?: string[];
  schedule?: ScheduleItem[];
  speakers?: Speaker[];
  memberAvatars?: string[];
}

// Sample data - in production, this would come from an API
const getEventDetail = (eventId: string): EventDetailType | null => {
  const events: Record<string, EventDetailType> = {
    '1': {
      id: '1',
      title: 'AI & Future Tech Summit 2025',
      host: 'TechNext Community',
      date: 'July 15, 2025',
      time: '10:00 AM - 4:00 PM',
      location: 'TechSphere Convention Hall, New York, NY',
      imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      videoUri: 'https://example.com/video',
      joinedCount: 50,
      isOnline: false,
      isPublic: false,
      tag: 'Private',
      isJoined: false,
      about: 'Discover the future at AI & Future Tech Summit 2025 — a premier gathering of innovators, tech leaders, and changemakers. Explore cutting-edge advancements in artificial intelligence, machine learning, robotics, and emerging technologies shaping tomorrow.',
      photos: [
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
      ],
      schedule: [
        {
          time: '10:00 AM - 10:30 AM',
          title: 'Opening Ceremony & Keynote Address',
          speaker: 'Dr. Neha Rathi, Director, FutureTech Institute',
        },
        {
          time: '10:30 AM - 11:15 AM',
          title: 'AI in Healthcare: Transforming Patient Care',
          speaker: 'Dr. Sarah Chen, Chief Medical Officer',
        },
        {
          time: '11:15 AM - 12:00 PM',
          title: 'Machine Learning for Business Intelligence',
          speaker: 'John Smith, Data Science Lead',
        },
        {
          time: '12:00 PM - 01:00 PM',
          title: 'Lunch Break & Networking',
        },
        {
          time: '01:00 PM - 01:45 PM',
          title: 'Robotics and Automation: The Future of Manufacturing',
          speaker: 'Michael Johnson, Robotics Engineer',
        },
        {
          time: '01:45 PM - 02:30 PM',
          title: 'Ethics in AI: Building Responsible Technology',
          speaker: 'Dr. Emily Watson, AI Ethics Researcher',
        },
        {
          time: '02:30 PM - 04:00 PM',
          title: 'Panel Discussion: The Future of Tech',
          speaker: 'Multiple Speakers',
        },
      ],
      speakers: [
        {
          id: '1',
          name: 'Dr. Fei-Fei Li',
          imageUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        },
        {
          id: '2',
          name: 'Sam Altman',
          imageUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
        },
      ],
      memberAvatars: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      ],
    },
    '2': {
      id: '2',
      title: 'AI & Future Tech Summit 2025',
      host: 'TechNext Community',
      date: 'July 15, 2025',
      time: '10:00 AM - 4:00 PM',
      virtualVenue: 'Zoom Meeting',
      imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      videoUri: 'https://example.com/video',
      joinedCount: 30,
      isOnline: true,
      isPublic: false,
      tag: 'Private',
      isJoined: false,
      about: 'Discover the future at AI & Future Tech Summit 2025 — a premier gathering of innovators, tech leaders, and changemakers. Explore cutting-edge advancements in artificial intelligence, machine learning, robotics, and emerging technologies shaping tomorrow.',
      photos: [
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
      ],
      schedule: [
        {
          time: '10:00 AM - 10:30 AM',
          title: 'Opening Ceremony & Keynote Address',
          speaker: 'Dr. Neha Rathi, Director, FutureTech Institute',
        },
        {
          time: '10:30 AM - 11:15 AM',
          title: 'AI in Healthcare: Transforming Patient Care',
          speaker: 'Dr. Sarah Chen, Chief Medical Officer',
        },
        {
          time: '11:15 AM - 12:00 PM',
          title: 'Machine Learning for Business Intelligence',
          speaker: 'John Smith, Data Science Lead',
        },
        {
          time: '12:00 PM - 01:00 PM',
          title: 'Lunch Break & Networking',
        },
        {
          time: '01:00 PM - 01:45 PM',
          title: 'Robotics and Automation: The Future of Manufacturing',
          speaker: 'Michael Johnson, Robotics Engineer',
        },
        {
          time: '01:45 PM - 02:30 PM',
          title: 'Ethics in AI: Building Responsible Technology',
          speaker: 'Dr. Emily Watson, AI Ethics Researcher',
        },
        {
          time: '02:30 PM - 04:00 PM',
          title: 'Panel Discussion: The Future of Tech',
          speaker: 'Multiple Speakers',
        },
      ],
      speakers: [
        {
          id: '1',
          name: 'Dr. Fei-Fei Li',
          imageUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        },
        {
          id: '2',
          name: 'Sam Altman',
          imageUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
        },
      ],
      memberAvatars: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      ],
    },
  };
  return events[eventId] || null;
};

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);

  const event = getEventDetail(eventId || '');

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleJoin = () => {
    setIsJoined(!isJoined);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    try {
      const eventLink = `https://www.kalon.net/events/${event.id}`;
      await Share.share({
        message: `Check out this event: ${event.title}\n${eventLink}`,
        url: eventLink,
        title: event.title,
      });
    } catch (error: any) {
      console.error('Error sharing:', error);
      if (error.message !== 'User did not share') {
        showToast.error('Failed to share event');
      }
    }
  };

  const handlePlayVideo = () => {
    // Video playback functionality
    console.log('Play video:', event.videoUri);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image */}
          <View style={styles.heroContainer}>
            {event.imageUri ? (
              <Image
                source={{ uri: event.imageUri }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Ionicons name="calendar-outline" size={48} color="#AF7DFF" />
              </View>
            )}

            {/* Overlay Icons */}
            <View style={styles.heroOverlay}>
              {/* Top Right - Action Icons */}
              <View style={styles.topRightIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <ShareIcon width={20} height={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
          
              </View>

              {/* Bottom Right - Event Type Badge */}
              <View
                style={styles.createButton}
              >
                <Text style={styles.createButtonText}>
                  {event.isOnline ? 'Online' : 'Onsite'}
                </Text>
              </View>
            </View>
          </View>

          {/* Event Info Section */}
          <View style={styles.eventInfoSection}>
            {event.tag && (
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{event.tag}</Text>
              </View>
            )}

            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventHost}>Hosted by - {event.host}</Text>

            <View style={styles.dateTimeContainer}>
              <CalendarIcon width={16} height={16} color="#AF7DFF" />
              <Text style={styles.dateTimeText}>
                {event.date} | {event.time}
              </Text>
            </View>

            {/* Joined Members and Location Cards */}
            <View style={styles.infoCardsContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>Joined Member</Text>
                <View style={styles.memberAvatarsContainer}>
                  {event.memberAvatars?.slice(0, 3).map((avatar, index) => (
                    <Image
                      key={index}
                      source={{ uri: avatar }}
                      style={[
                        styles.memberAvatar,
                        { marginLeft: index > 0 ? -8 : 0 },
                      ]}
                    />
                  ))}
                  <Text style={styles.memberCount}>{event.joinedCount}+</Text>
                </View>
              </View>

              {(event.location || event.virtualVenue) && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>
                    {event.isOnline ? 'Virtual Venue' : 'Location'}
                  </Text>
                  <Text style={styles.locationText}>
                    {event.isOnline ? event.virtualVenue : event.location}
                  </Text>
                </View>
              )}
            </View>

            {/* About Event Section */}
            {event.about && (
              <View style={styles.aboutSection}>
                <Text style={styles.sectionTitle}>About Event</Text>
                <Text
                  style={styles.aboutText}
                  numberOfLines={showFullAbout ? undefined : 4}
                >
                  {event.about}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFullAbout(!showFullAbout)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.readMoreText}>
                    {showFullAbout ? 'Read Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Photos Section */}
            {event.photos && event.photos.length > 0 && (
              <View style={styles.photosSection}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photosContainer}
                >
                  {event.photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.photoThumbnail}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Event Schedule Section */}
            {event.schedule && event.schedule.length > 0 && (
              <View style={styles.scheduleSection}>
                <Text style={styles.sectionTitle}>Event Schedule</Text>
                {event.schedule.map((item, index) => (
                  <View key={index} style={styles.scheduleItem}>
                    <View style={styles.scheduleItemLeft}>
                      <CalendarIcon width={16} height={16} color="#AF7DFF" />
                      <View style={styles.scheduleItemContent}>
                        <Text style={styles.scheduleTime}>{item.time}</Text>
                        <Text style={styles.scheduleTitle}>{item.title}</Text>
                        {item.speaker && (
                          <Text style={styles.scheduleSpeaker}>
                            {item.speaker}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#AF7DFF"
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Speakers / Guests Section */}
            {event.speakers && event.speakers.length > 0 && (
              <View style={styles.speakersSection}>
                <Text style={styles.sectionTitle}>Speakers / Guests</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.speakersContainer}
                >
                  {event.speakers.map((speaker) => (
                    <View key={speaker.id} style={styles.speakerCard}>
                      <Image
                        source={{
                          uri:
                            speaker.imageUri ||
                            'https://via.placeholder.com/100',
                        }}
                        style={styles.speakerAvatar}
                        resizeMode="cover"
                      />
                      <Text style={styles.speakerName}>{speaker.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Join Button - Fixed at Bottom */}
        <View style={styles.joinButtonContainer}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined && styles.joinButtonJoined,
            ]}
            onPress={handleJoin}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.joinButtonText,
                isJoined && styles.joinButtonTextJoined,
              ]}
            >
              {isJoined ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButtonFixed}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <BackArrowIcon width={24} height={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 100, // Space for fixed join button
  },
  heroContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },

  topRightIcons: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#1AA7FF99',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  eventInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tagContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tagText: {
    color: '#4E4C57',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  eventHost: {
    fontSize: 14,
    color: '#4E4C57',
    marginBottom: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F5EEFF',
    padding: 16,
    borderRadius: 12,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#4E4C57',
    marginBottom: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  memberAvatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  locationText: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  aboutSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  aboutText: {
    fontSize: 14,
    color: '#4E4C57',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  readMoreText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  photosSection: {
    marginBottom: 24,
  },
  photosContainer: {
    gap: 12,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scheduleItemLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  scheduleItemContent: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  scheduleTitle: {
    fontSize: 14,
    color: '#0D0A1B',
    marginBottom: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  scheduleSpeaker: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  speakersSection: {
    marginBottom: 24,
  },
  speakersContainer: {
    gap: 16,
  },
  speakerCard: {
    alignItems: 'center',
    width: 100,
  },
  speakerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  speakerName: {
    fontSize: 12,
    color: '#0D0A1B',
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
  },
  joinButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  joinButton: {
    backgroundColor: '#AF7DFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonJoined: {
    backgroundColor: '#F5F5F5',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  joinButtonTextJoined: {
    color: '#4E4C57',
  },
  backButtonFixed: {
    position: 'absolute',
    top: 50,
    left: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#4E4C57',
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  backButton: {
    backgroundColor: '#AF7DFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

