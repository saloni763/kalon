import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumGemIcon from './ui/PremiumGemIcon';

interface PremiumBannerProps {
  onPress?: () => void;
}

export default function PremiumBanner({ onPress }: PremiumBannerProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7436D7', '#AF7DFF']}
        start={{ x: 0, y: 4 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        {/* Left Section - Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <PremiumGemIcon width={24} height={24} color="#7436D7" />
          </View>
        </View>

        {/* Middle Section - Text */}
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Upgrade to Premium</Text>
          <Text style={styles.subText}>Exclusive features, no ads.</Text>
        </View>

        {/* Right Section - Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Go Premium</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  mainText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
    opacity: 0.9,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
});

