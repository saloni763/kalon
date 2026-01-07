import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

/**
 * Custom toast configuration to match app theme
 */
export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4CAF50', borderLeftWidth: 4 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
        color: '#0D0A1B',
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#4E4C57',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF3B30', borderLeftWidth: 4 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
        color: '#0D0A1B',
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#4E4C57',
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#AF7DFF', borderLeftWidth: 4 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Montserrat_600SemiBold',
        color: '#0D0A1B',
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: 'Montserrat_400Regular',
        color: '#4E4C57',
      }}
    />
  ),
  // Custom toast for "Link copied to clipboard"
  linkCopied: (props: any) => (
    <View style={customToastStyles.purpleBanner}>
      <Text style={customToastStyles.bannerText}>{props.text1 || 'Link copied to clipboard'}</Text>
    </View>
  ),
  // Custom toast for "Saved" with See All button
  saved: (props: any) => {
    const onSeeAll = props.props?.onSeeAll || (() => {});
    return (
      <View style={customToastStyles.purpleBanner}>
        <View style={customToastStyles.savedContent}>
          <View style={customToastStyles.savedLeft}>
            <View style={customToastStyles.bookmarkIconContainer}>
              <Ionicons name="bookmark" size={12} color="#AF7DFF" />
            </View>
            <Text style={customToastStyles.bannerText}>Saved</Text>
          </View>
          <TouchableOpacity onPress={onSeeAll} style={customToastStyles.seeAllButton}>
            <Text style={customToastStyles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  // Custom toast for "Notify" with Manage button
  notify: (props: any) => {
    const onManage = props.props?.onManage || (() => {});
    return (
      <View style={customToastStyles.purpleBanner}>
        <View style={customToastStyles.notifyContent}>
          <Text style={customToastStyles.bannerText} numberOfLines={1}>
            {props.text1 || 'You\'ll be notified when they post'}
          </Text>
          <TouchableOpacity onPress={onManage}>
            <Text style={customToastStyles.manageText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
};

const customToastStyles = StyleSheet.create({
  purpleBanner: {
    backgroundColor: '#7436D7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#AF7DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '92%',
    alignSelf: 'center',
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
  },
  savedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bookmarkIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
  },
  notifyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  manageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
  },
});

