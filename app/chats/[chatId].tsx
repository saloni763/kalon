import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BackArrowIcon from '@/components/BackArrowIcon';
import VoiceRecordingModal from '@/components/voice-recording-modal';
import VoiceMessage from '@/components/voice-message';
import MicrophoneIcon from '@/components/ui/MicrophoneIcon';
import PhoneIcon from '@/components/ui/phone-icon';
import VideoCallIcon from '@/components/ui/videoCall-icon';
import PremiumBanner from '@/components/PremiumBanner';
import SendIcon from '@/components/ui/SendIcon';
import AddIcon from '@/components/ui/AddIcon';
interface Message {
  id: string;
  text?: string;
  image?: string;
  voiceMessage?: {
    duration: string;
    audioUrl?: string;
  };
  timestamp: string;
  isSent: boolean;
  senderName?: string;
  senderImage?: string;
}

interface DateSeparator {
  type: 'date';
  date: string;
}

type ChatItem = Message | DateSeparator;

const messages: ChatItem[] = [
  { type: 'date', date: '25 May 2025' },
  {
    id: '1',
    text: 'Hello! Michael',
    timestamp: '9:25 am',
    isSent: true,
  },
  {
    id: '2',
    text: 'Hello! John',
    timestamp: '10:30 am',
    isSent: false,
    senderName: 'John',
    senderImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '3',
    text: 'No',
    timestamp: '10:35 am',
    isSent: true,
  },
  { type: 'date', date: 'Yesterday' },
  {
    id: '4',
    text: 'How did you get into your current line of work?',
    timestamp: '9:25 am',
    isSent: true,
  },
  {
    id: '5',
    text: 'Hey, are we still meeting at the library',
    timestamp: '10:30 am',
    isSent: false,
    senderName: 'John',
    senderImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    timestamp: '9:25 am',
    isSent: true,
  },
  {
    id: '7',
    voiceMessage: {
      duration: '00:16',
    },
    timestamp: '10:40 am',
    isSent: true,
  },
  {
    id: '8',
    voiceMessage: {
      duration: '00:23',
    },
    timestamp: '10:42 am',
    isSent: false,
    senderName: 'John',
    senderImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const [messageText, setMessageText] = useState('');
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingVoiceMessageId, setPlayingVoiceMessageId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Mock data - in real app, fetch based on chatId
  const chatInfo = {
    id: chatId || '1',
    userId: chatId || '1', // The other user's ID (the person you're chatting with)
    name: 'Michael Rodgers',
    isOnline: true,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  };

  // Handle keyboard show/hide
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = () => {
    if (messageText.trim()) {
      // Handle send message logic
      setMessageText('');
    }
  };

  const handleMicPress = () => {
    setIsVoiceModalVisible(true);
    setIsListening(true);
    // TODO: Start voice recording here
  };

  const handleStopRecording = () => {
    setIsListening(false);
    // TODO: Stop voice recording and process audio here
  };

  const handleVoiceMessagePlay = (messageId: string) => {
    if (playingVoiceMessageId === messageId) {
      setPlayingVoiceMessageId(null);
      // TODO: Pause audio playback
    } else {
      setPlayingVoiceMessageId(messageId);
      // TODO: Start audio playback
    }
  };

  // Navigate to user profile
  const handleProfilePress = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  const renderMessage = (item: ChatItem, index: number) => {
    if ((item as unknown as DateSeparator).type === 'date') {
      return (
        <View key={`date-${index}`} style={styles.dateSeparator}>
          <View style={styles.dateSeparatorBox}>
            <Text style={styles.dateSeparatorText}>{(item as unknown as DateSeparator).date}</Text>
          </View>
        </View>
      );
    }

    const message = item as Message;

    if (message.isSent) {
      return (
        <View key={message.id} style={styles.messageContainerRight}>
          {message.image ? (
            <View style={styles.sentImageContainer}>
              <Image source={{ uri: message.image }} style={styles.messageImage} />
            </View>
          ) : message.voiceMessage ? (
            <View>
              <VoiceMessage
                duration={message.voiceMessage.duration}
                isPlaying={playingVoiceMessageId === message.id}
                onPlayPress={() => handleVoiceMessagePlay(message.id)}
                variant="sent"
              />
            </View>
          ) : (
            <View style={styles.sentMessageBubble}>
              <Text style={styles.sentMessageText}>{message.text}</Text>
            </View>
          )}
          <Text style={styles.messageTimestamp}>{message.timestamp}</Text>
        </View>
      );
    } else {
      return (
        <View key={message.id} style={styles.messageContainerLeft}>
          <TouchableOpacity
            onPress={() => handleProfilePress(chatInfo.userId)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: message.senderImage || chatInfo.profileImage }}
              style={styles.senderAvatar}
            />
          </TouchableOpacity>
          {message.image ? (
            <View>
              <View style={styles.receivedImageContainer}>
                <Image source={{ uri: message.image }} style={styles.messageImage} />
              </View>
              <Text style={styles.messageTimestamp}>{message.timestamp}</Text>
            </View>
          ) : message.voiceMessage ? (
            <View style={styles.receivedVoiceMessageContainer}>
              <VoiceMessage
                duration={message.voiceMessage.duration}
                isPlaying={playingVoiceMessageId === message.id}
                onPlayPress={() => handleVoiceMessagePlay(message.id)}
                variant="received"
              />
              <Text style={styles.messageTimestamp}>{message.timestamp}</Text>
            </View>
          ) : (
            <View>
              <View style={styles.receivedMessageBubble}>
                <Text style={styles.receivedMessageText}>{message.text}</Text>
              </View>
              <Text style={styles.messageTimestamp}>{message.timestamp}</Text>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <BackArrowIcon width={24} height={24} color="#0D0A1B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerProfileContainer}
            onPress={() => handleProfilePress(chatInfo.userId)}
            activeOpacity={0.7}
          >
            <View style={styles.headerProfileImageContainer}>
              <Image
                source={{ uri: chatInfo.profileImage }}
                style={styles.headerProfileImage}
              />
              {chatInfo.isOnline && (
                <View style={styles.headerOnlineIndicator} />
              )}
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{chatInfo.name}</Text>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
              <PhoneIcon width={24} height={24} color="#7436D7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
              <VideoCallIcon width={24} height={24} color="#7436D7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.map((item, index) => renderMessage(item, index))}
        </ScrollView>
        <PremiumBanner onPress={() => {
            router.push('/profile/subscription');
          }} />
        {/* Message Input */}
        <View style={[styles.inputContainer, keyboardHeight > 0 && { marginBottom: Platform.OS === 'android' ? keyboardHeight : 0 }]}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
              <AddIcon width={24} height={24} color="#4E4C57" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Write your message..."
              placeholderTextColor="#4E4C57"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={styles.micButton} 
              activeOpacity={0.7}
              onPress={handleMicPress}
            >
              <MicrophoneIcon width={20} height={25} color="#4E4C57" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!messageText.trim()}
          >
            <SendIcon 
              width={20} 
              height={20} 
              color={!messageText.trim() ? "#F5F5F5" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </View>

        {/* Voice Recording Modal */}
        <VoiceRecordingModal
          visible={isVoiceModalVisible}
          onClose={() => setIsVoiceModalVisible(false)}
          isListening={isListening}
          onStop={handleStopRecording}
        />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  headerProfileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  headerOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#29AE18',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorBox: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  messageContainerRight: {
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingLeft: 60,
  },
  messageContainerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingRight: 60,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  receivedVoiceMessageContainer: {
    flex: 1,
  },
  sentMessageBubble: {
    backgroundColor: '#AF7DFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
    marginBottom: 4,
  },
  receivedMessageBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sentMessageText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    lineHeight: 22,
  },
  receivedMessageText: {
    fontSize: 15,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    lineHeight: 22,
  },
  messageImage: {
    width: 200,
    height: 150,
    backgroundColor: '#F5F5F5',
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
  },
  sentImageContainer: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#7436D7',
    overflow: 'hidden',
    marginBottom: 4,
  },
  receivedImageContainer: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#EBEBEB',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
    paddingVertical: 4,
    maxHeight: 100,
  },
  micButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7436D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#7436D7',
    opacity: 0.6,
  },
});

