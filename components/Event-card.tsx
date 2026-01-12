import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ShareIcon from '@/assets/icons/Share.svg';

export interface EventType {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  imageUri?: string;
  joinedCount: number;
  isOnline: boolean;
  isPublic: boolean;
  tag?: string;
  isJoined?: boolean;
}

interface EventProps {
  event: EventType;
  onJoin?: (eventId: string) => void;
  onShare?: (eventId: string) => void;
  onSave?: (eventId: string) => void;
}

export default function Event({
  event,
  onJoin,
  onShare,
  onSave,
}: EventProps) {
  const [isJoined, setIsJoined] = useState(event.isJoined || false);
  const [isSaved, setIsSaved] = useState(false);

  const handleJoin = () => {
    setIsJoined(!isJoined);
    onJoin?.(event.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(event.id);
  };

  const handleShare = () => {
    onShare?.(event.id);
  };

  return (
    <View style={styles.eventCard}>
      {/* Event Image */}
      <View style={styles.imageContainer}>
        {event.imageUri ? (
          <Image
            source={{ uri: event.imageUri }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.eventImagePlaceholder}>
            <Ionicons name="calendar-outline" size={48} color="#AF7DFF" />
          </View>
        )}

        {/* Overlay Icons */}
        <View style={styles.imageOverlay}>
          <View style={styles.overlayTopRight}>
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

          <View style={styles.overlayBottom}>
            <View style={styles.overlayBottomLeft}>
              <View style={styles.joinedBadge}>
                <Ionicons name="people" size={14} color="#FFFFFF" />
                <Text style={styles.joinedText}>{event.joinedCount}+ Joined</Text>
              </View>
            </View>
            <View style={styles.overlayBottomRight}>
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineText}>
                  {event.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <View style={styles.eventHeader}>
          {event.tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{event.tag}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.joinButton, isJoined && styles.joinButtonJoined]}
            onPress={handleJoin}
            activeOpacity={0.8}
          >
            <Text style={[styles.joinButtonText, isJoined && styles.joinButtonTextJoined]}>
              {isJoined ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventHost}>Hosted by • {event.host}</Text>
        <View style={styles.eventDateTime}>
          <Ionicons name="calendar-outline" size={16} color="#4E4C57" />
          <Text style={styles.dateTimeText}>
            {event.date} | {event.time}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 12,
  },
  overlayTopRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  overlayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  overlayBottomLeft: {
    flex: 1,
  },
  overlayBottomRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(175, 125, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  joinedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  onlineBadge: {
    backgroundColor: 'rgba(175, 125, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  onlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#0D0A1B',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  joinButton: {
    backgroundColor: '#AF7DFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonJoined: {
    backgroundColor: '#F5F5F5',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  joinButtonTextJoined: {
    color: '#4E4C57',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D0A1B',
    marginBottom: 6,
    fontFamily: 'Montserrat_700Bold',
  },
  eventHost: {
    fontSize: 14,
    color: '#4E4C57',
    marginBottom: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  eventDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
});

