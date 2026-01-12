import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChevronForwardIcon from '@/assets/icons/cheveron-report.svg';
import BlockIcon from '@/assets/icons/block-user.svg';
import UnfollowIcon from '@/assets/icons/unfollow.svg';
import FeedbackIcon from '@/assets/icons/feedback.svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReportDrawerProps {
  visible: boolean;
  onClose: () => void;
  onReportReasonSelected?: (reason: string) => void;
  userName?: string;
  onBlock?: () => void;
  onRestrict?: () => void;
  onUnfollow?: () => void;
}

const REPORT_REASONS = [
  'Nudity or Sexual Content',
  'Hate Speech or Symbols',
  'Violence or Threats',
  'Harassment or Bullying',
  'False Information',
  'Spam or Scam',
  'Self-Injury or Suicide',
  'Child Exploitation',
  'Intellectual Property Violation',
  'Illegal Activities',
  'Offensive or Disturbing Content',
  'Other',
];

export default function ReportDrawer({
  visible,
  onClose,
  onReportReasonSelected,
  userName = 'this user',
  onBlock,
  onRestrict,
  onUnfollow,
}: ReportDrawerProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset confirmation state when drawer closes
  useEffect(() => {
    if (!visible) {
      setShowConfirmation(false);
    }
  }, [visible]);

  const handleReasonPress = (reason: string) => {
    onReportReasonSelected?.(reason);
    setShowConfirmation(true);
  };

  const handleActionPress = (action: 'block' | 'restrict' | 'unfollow') => {
    switch (action) {
      case 'block':
        onBlock?.();
        break;
      case 'restrict':
        onRestrict?.();
        break;
      case 'unfollow':
        onUnfollow?.();
        break;
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={styles.content}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {!showConfirmation ? (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Report</Text>
                <Text style={styles.subtitle}>Why are you reporting this post?</Text>
                <Text style={styles.disclaimer}>
                  Your report is anonymous. If someone is in immediate danger, call the local emergency services - don't wait.
                </Text>
              </View>

              {/* Report Reasons List */}
              <ScrollView 
                style={styles.reasonsList}
                contentContainerStyle={styles.reasonsListContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {REPORT_REASONS.map((reason, index) => (
                  <React.Fragment key={reason}>
                    <TouchableOpacity
                      style={styles.reasonItem}
                      onPress={() => handleReasonPress(reason)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reasonText}>{reason}</Text>
                      <ChevronForwardIcon width={20} height={20} color="#4E4C57" />
                    </TouchableOpacity>
                    {index < REPORT_REASONS.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              {/* Confirmation Screen */}
              <View style={styles.confirmationContainer}>
                {/* Success Icon */}
                <View style={styles.successIconContainer}>
                  <FeedbackIcon width={48} height={48} color="#34C759" />
                </View>

                {/* Thanks Message */}
                <Text style={styles.thanksMessage}>Thanks for your feedback</Text>

                {/* Other Steps Section */}
                <View style={styles.otherStepsSection}>
                  <Text style={styles.otherStepsHeading}>Other steps you can take</Text>
                  
                  <View style={styles.actionsList}>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleActionPress('block')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionText}>Block {userName}</Text>
                      <ChevronForwardIcon width={24} height={24} color="#4E4C57" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleActionPress('restrict')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionText}>Restrict {userName}</Text>
                      <ChevronForwardIcon width={24} height={24} color="#4E4C57" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleActionPress('unfollow')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionText}>Unfollow {userName}</Text>
                      <ChevronForwardIcon width={24} height={24} color="#4E4C57" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.9,
    height: SCREEN_HEIGHT * 0.85,
    flexDirection: 'column',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0D0A1B',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#0D0A1B',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  disclaimer: {
    fontSize: 14,
    color: '#4E4C57',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
  },
  reasonsList: {
    flex: 1,
  },
  reasonsListContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    minHeight: 48,
  },
  reasonText: {
    fontSize: 16,
    color: '#0D0A1B',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 0,
  },
  confirmationContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#DFFFDB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  thanksMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D0A1B',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'sans-serif',
  },
  otherStepsSection: {
    width: '100%',
    alignSelf: 'flex-start',
  },
  otherStepsHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    marginBottom: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  actionsList: {
    width: '100%',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    minHeight: 48,
  },
  actionText: {
    fontSize: 16,
    color: '#0D0A1B',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

