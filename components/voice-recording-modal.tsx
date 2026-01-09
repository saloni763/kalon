import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import MicrophoneIcon from '@/components/ui/MicrophoneIcon';

interface VoiceRecordingModalProps {
  visible: boolean;
  onClose: () => void;
  isListening?: boolean;
  onStop?: () => void;
}

export default function VoiceRecordingModal({
  visible,
  onClose,
  isListening = true,
  onStop,
}: VoiceRecordingModalProps) {
  

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.blurContainer}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <Text style={styles.headerText}>Stop talking to send...</Text>

            {/* Circular Microphone Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.outerRing}>
                <View style={styles.innerCircle}>
                  <MicrophoneIcon width={45} height={45} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Instruction Text */}
            <Text style={styles.instructionText}>Try saying something</Text>

            {/* Status Text */}
            <Text style={styles.statusText}>
              {isListening ? 'Listening...' : 'Processing...'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 32,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8D5FF', // Light purple
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#AF7DFF', // Dark purple
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 24,
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#7436D7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
});

