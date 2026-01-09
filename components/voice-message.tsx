import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PlayIcon from '@/components/ui/PlayIcon';
import WaveformIcon from '@/components/ui/WaveformIcon';

interface VoiceMessageProps {
  duration: string; // e.g., "00:16"
  isPlaying?: boolean;
  onPlayPress?: () => void;
  variant?: 'sent' | 'received';
}

export default function VoiceMessage({
  duration,
  isPlaying = false,
  onPlayPress,
  variant = 'sent',
}: VoiceMessageProps) {

  const handlePlayPress = () => {
    onPlayPress?.();
  };

  return (
    <View style={[styles.container, variant === 'sent' ? styles.sentContainer : styles.receivedContainer]}>
      {/* Play Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayPress}
        activeOpacity={0.7}
      >
        <View style={styles.playButtonCircle}>
          {isPlaying ? (
            <MaterialIcons name="pause" size={30} color="#AF7DFF" />
          ) : (
            <PlayIcon width={30} height={30} color="#AF7DFF" />
          )}
        </View>
      </TouchableOpacity>

      {/* Waveform */}
      <View style={styles.waveformContainer}>
        <WaveformIcon width={80} height={14} color="#FFFFFF" />
        <WaveformIcon width={80} height={14} color="#FFFFFF" />
      </View>

      {/* Duration */}
      <Text style={styles.durationText}>{duration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    minWidth: 250,
    maxWidth: 450,
  },
  sentContainer: {
    backgroundColor: '#AF7DFF', 
  },
  receivedContainer: {
    backgroundColor: '#AF7DFF', 
  },
  playButton: {
    marginRight: 12,
  },
  playButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    display: 'flex',
    flexDirection: 'row',
    
  },
  durationText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    minWidth: 40,
    textAlign: 'right',
  },
});
