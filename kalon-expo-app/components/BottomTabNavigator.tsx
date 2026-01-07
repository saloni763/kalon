import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabItem = {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const tabs: TabItem[] = [
  { name: 'home', route: '/homepage/home', icon: 'home', label: 'Home' },
  { name: 'search', route: '/search', icon: 'search-outline', label: 'Search' },
  { name: 'create', route: '/create', icon: 'add', label: '' }, // Special button, no label
  { name: 'chats', route: '/chats', icon: 'chatbubble-outline', label: 'Chats' },
  { name: 'events', route: '/events', icon: 'calendar-outline', label: 'Events' },
];

export default function BottomTabNavigator() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show bottom tab on auth screens, onboarding, index, create page, or profile edit screens
  const isAuthScreen = pathname?.startsWith('/auth') || 
                       pathname?.startsWith('/onboard') || 
                       pathname === '/' || 
                       pathname === '/index' ||
                       pathname === '/create' ||
                       pathname?.startsWith('/profile/edit-profile') ||
                       pathname?.startsWith('/profile/personal-info') ||
                       pathname?.startsWith('/profile/social-network') ||
                       pathname?.startsWith('/profile/education-role') ||
                       pathname?.startsWith('/profile/skills-interests') ||
                       pathname?.startsWith('/profile/subscription') ||
                       pathname?.startsWith('/saved') ||
                       pathname === '/notifications' ||
                       pathname === '/notifications-list' ||
                       pathname === '/social-activity' ||
                       pathname === '/messages-settings' ||
                       pathname === '/channels-events-settings' ||
                       pathname === '/announcements-settings' ||
                       pathname === '/privacy-settings' ||
                       pathname === '/followers-following';
  if (isAuthScreen) {
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
                <Ionicons name={tab.icon} size={32} color="#FFFFFF" />
              </TouchableOpacity>
            );
          }

          // Use filled icon for active tabs, outline for inactive
          const iconName = active 
            ? (tab.name === 'home' ? 'home' : tab.icon.replace('-outline', ''))
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
    backgroundColor: '#7436D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

