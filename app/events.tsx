import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import SearchIcon from '@/components/ui/SearchIcon';
import Event, { EventType } from '@/components/Event-card';

const categories = ['All Events', 'Music', 'Sports', 'Community'];

const sampleEvents: EventType[] = [
  {
    id: '1',
    title: 'AI & Future Tech Summit 2025',
    host: 'TechNext Community',
    date: 'July 15, 2025',
    time: '10:00 AM – 4:00 PM',
    location: 'TechSphere Convention Hall, New York, NY',
    imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    joinedCount: 40,
    isOnline: false,
    isPublic: false,
    isJoined: false,
  },
  {
    id: '2',
    title: 'Mind Matters: Mental Wellness Workshop',
    host: 'CalmCare Foundation',
    date: 'August 10, 2025',
    time: '9:30 AM – 1:00 PM',
    imageUri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    joinedCount: 40,
    isOnline: true,
    isPublic: true,
    isJoined: false,
  },
  {
    id: '3',
    title: 'Neighborhood Culture Fest 2025',
    host: 'Riverdale Community Group',
    date: 'September 3, 2025',
    time: '4:00 PM – 9:00 PM',
    location: 'Harmony Park, Riverdale, IL',
    imageUri: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    joinedCount: 40,
    isOnline: false,
    isPublic: false,
    isJoined: true,
  },
  {
    id: '4',
    title: 'Mind Matters: Mental Wellness Workshop',
    host: 'CalmCare Foundation',
    date: 'August 10, 2025',
    time: '9:30 AM – 1:00 PM',
    imageUri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    joinedCount: 40,
    isOnline: true,
    isPublic: true,
    isJoined: false,
  },
];

export default function EventsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All Events');

  const handleJoin = (eventId: string) => {
    console.log('Join event:', eventId);
  };

  const handleShare = (eventId: string) => {
    console.log('Share event:', eventId);
  };

  const handleSave = (eventId: string) => {
    console.log('Save event:', eventId);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <View style={styles.searchIconContainer}>
              <SearchIcon width={20} height={20} color="#AF7DFF" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Don't have any Events yet Section */}
          <View style={styles.emptyStateSection}>
            <Text style={styles.emptyStateTitle}>Don't have any Events yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your own event and invite your friends or the community.
            </Text>
            <TouchableOpacity style={styles.createEventButton} activeOpacity={0.8}>
              <Text style={styles.createEventButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>

          {/* Discover Events Section */}
          <View style={styles.discoverSection}>
            <View style={styles.discoverHeader}>
              <Text style={styles.discoverTitle}>Discover Events</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.exploreAllText}>Explore All</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Event Cards */}
            <View style={styles.eventsList}>
              {sampleEvents.map((event) => (
                <Event
                  key={event.id}
                  event={event}
                  onJoin={handleJoin}
                  onShare={handleShare}
                  onSave={handleSave}
                />
              ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyStateSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#4E4C57',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  createEventButton: {
    backgroundColor: '#E8D5FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  createEventButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
  },
  discoverSection: {
    paddingTop: 8,
  },
  discoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  discoverTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  exploreAllText: {
    fontSize: 14,
    color: '#AF7DFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryButtonActive: {
    backgroundColor: '#E8D5FF',
    borderColor: '#E8D5FF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4E4C57',
    fontFamily: 'Montserrat_500Medium',
  },
  categoryButtonTextActive: {
    color: '#0D0A1B',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  eventsList: {
    paddingTop: 8,
  },
});
