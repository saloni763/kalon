import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchIcon from '@/components/ui/SearchIcon';
import HomeIcon from '@/components/ui/HomeIcon';
import CalendarIcon from '@/components/ui/CalendarIcon';
import MessageIcon from '@/components/ui/MessageIcon';
import AddLeadIcon from '@/components/ui/AddLeadIcon';

type TabItem = {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const tabs: TabItem[] = [
  { name: 'home', route: '/homepage/home', icon: 'home', label: 'Home' },
  { name: 'search', route: '/search/search', icon: 'search', label: 'Search' },
  { name: 'create', route: '/post/create', icon: 'add', label: '' }, // Special button, no label
  { name: 'chats', route: '/chats/chats', icon: 'chatbubble-outline', label: 'Chats' },
  { name: 'events', route: '/events/events', icon: 'calendar-outline', label: 'Events' },
];

export default function BottomTabNavigator() {
  const pathname = usePathname();
  const router = useRouter();

  // Only show bottom tab on these allowed paths
  const allowedPaths = [
    '/homepage/home',
    '/search/search',
    '/events/events',
    '/chats/chats',
  ];
  
  // Profile route names that are NOT allowed (settings, edit pages, etc.)
  const profileRouteNames = [
    'edit-profile',
    'personal-info',
    'social-network',
    'education-role',
    'skills-interests',
    'subscription',
    'saved',
    'notifications',
    'social-activity',
    'messages-settings',
    'channels-events-settings',
    'announcements-settings',
    'privacy-settings',
    'followers-following',
  ];
  
  // Check if current path is an allowed screen
  const isAllowedScreen = allowedPaths.includes(pathname || '') ||
    // Allow profile/[userId] routes (any /profile/ path that's not a known route name)
    (pathname?.startsWith('/profile/') && 
     !profileRouteNames.some(routeName => pathname.includes(`/profile/${routeName}`)));
  
  if (!isAllowedScreen) {
    return null;
  }

  const handleTabPress = (route: string) => {
    // Use replace to prevent navigation stack buildup when switching tabs
    if (pathname !== route) {
      router.replace(route as any);
    }
  };

  const isActive = (route: string) => {
    if (route === '/homepage/home') {
      return pathname === '/homepage/home';
    }
    return pathname?.startsWith(route);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          
          // Special handling for the center "Create" button
          if (tab.name === 'create') {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.createButton}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.8}
              >
                <AddLeadIcon width={96} height={96} />
              </TouchableOpacity>
            );
          }

          // Special handling for search tab - use SearchIcon
          if (tab.name === 'search') {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <SearchIcon
                  width={24}
                  height={24}
                  color={active ? '#7436D7' : '#4E4C57'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    active && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          // Special handling for home tab - use HomeIcon
          if (tab.name === 'home') {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <HomeIcon
                  width={24}
                  height={24}
                  color={active ? '#7436D7' : '#4E4C57'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    active && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          // Special handling for events tab - use CalendarIcon
          if (tab.name === 'events') {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <CalendarIcon
                  width={24}
                  height={24}
                  color={active ? '#7436D7' : '#4E4C57'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    active && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          // Special handling for chats tab - use MessageIcon
          if (tab.name === 'chats') {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <MessageIcon
                  width={24}
                  height={24}
                  color={active ? '#7436D7' : '#4E4C57'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    active && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          // Fallback for any other tabs - use Ionicons
          const iconName = active 
            ? tab.icon.replace('-outline', '')
            : tab.icon;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={active ? '#7436D7' : '#4E4C57'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  active && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    height: 60,
    paddingTop: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#4E4C57',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  tabLabelActive: {
    color: '#AF7DFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});

