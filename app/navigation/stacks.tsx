import { Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomTabNavigator from '@/components/BottomTabNavigator';

/**
 * Root navigation stack
 * Handles all routes in the application
 * Note: Initial routing is handled by app/index.tsx based on authentication status
 */
export function RootStack() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers globally
          animation: 'default', // Use default slide animation
          gestureEnabled: true, // Enable swipe back gesture
        }}>
        
        {/* Onboarding & Initial Screens */}
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Prevent going back from index
          }} 
        />
        <Stack.Screen 
          name="onboard/onboarding" 
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Prevent going back from onboarding
          }} 
        />

        {/* Authentication Screens */}
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="auth/signup" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="auth/otp-verification" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="auth/personal-info" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="auth/forgot-password" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="auth/create-new-password" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />

        {/* Main App Screens (Authenticated) */}
        <Stack.Screen 
          name="homepage/home" 
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Prevent going back to auth screens
          }} 
        />
        <Stack.Screen 
          name="create" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="events" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="chats/chats" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="chats/[chatId]" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="search/search" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="profile/saved" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/notifications" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="notifications-list" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/social-activity" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/messages-settings" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/channels-events-settings" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/announcements-settings" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/privacy-settings" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/followers-following" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/[userId]" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/edit-profile" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/personal-info" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/social-network" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/education-role" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/skills-interests" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/subscription" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
      
      {/* Bottom Tab Navigator - Only visible on main app screens */}
      <BottomTabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

