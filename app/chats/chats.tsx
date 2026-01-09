import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SearchIcon from '@/components/ui/SearchIcon';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  profileImage: string;
  isGroup?: boolean;
}

const chats: Chat[] = [
  {
    id: '1',
    name: 'Michael Rodgers',
    lastMessage: 'Hey, are we still meeting at the libr...',
    timestamp: '1 min',
    unreadCount: 2,
    isOnline: true,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '2',
    name: 'Brainstorm Squad',
    lastMessage: 'Thanks for the feedback on my po...',
    timestamp: '2 hour ago',
    isGroup: true,
    profileImage: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Brain',
  },
  {
    id: '3',
    name: 'Tracey Duke',
    lastMessage: 'Group project deadline is next Fr...',
    timestamp: 'Yesterday',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: '4',
    name: 'Curtis Smith',
    lastMessage: 'Haha yeah',
    timestamp: '10 days ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '5',
    name: 'Josephine Daniels',
    lastMessage: 'Let\'s plan the study group for Sun...',
    timestamp: '10 may',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '6',
    name: 'Melissa Davis',
    lastMessage: 'Hey',
    timestamp: '1 month ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '7',
    name: 'Midnight Chillers',
    lastMessage: 'Zoom link is in the group chat, join...',
    timestamp: '3 month ago',
    isGroup: true,
    profileImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150',
  },
  {
    id: '8',
    name: 'Charles Joyce',
    lastMessage: 'Thanks',
    timestamp: '6 month ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '9',
    name: 'Alan Holt',
    lastMessage: 'Okay. Bye',
    timestamp: '1 year ago',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

export default function ChatsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'message' | 'channels'>('message');
  const totalUnreadCount = chats.filter(chat => chat.unreadCount).reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  const renderChatItem = (chat: Chat) => (
    <TouchableOpacity
      key={chat.id}
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => router.push(`/chats/${chat.id}` as any)}
    >
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: chat.profileImage }}
          style={styles.profileImage}
        />
        {chat.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
          <Text style={styles.timestamp}>{chat.timestamp}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
          {chat.unreadCount && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <SearchIcon width={24} height={24} color="#7436D7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <MaterialIcons name="more-horiz" size={24} color="#7436D7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'message' && styles.activeTab]}
            onPress={() => setActiveTab('message')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'message' && styles.activeTabText]}>
              Message
            </Text>
            {activeTab === 'message' && totalUnreadCount > 0 && (
              <View style={styles.tabUnreadBadge}>
                <Text style={styles.tabUnreadCount}>{totalUnreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'channels' && styles.activeTab]}
            onPress={() => setActiveTab('channels')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'channels' && styles.activeTabText]}>
              Channels
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {chats.map(renderChatItem)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    gap: 8,
    width: '50%',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7436D7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4E4C57',
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeTabText: {
    color: '#7436D7',
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  tabUnreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7436D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabUnreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#29AE18',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0A1B',
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
  },
  timestamp: {
    fontSize: 14,
    color: '#4E4C57',
    marginLeft: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#4E4C57',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7436D7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

