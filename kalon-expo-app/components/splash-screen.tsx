import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// Colors based on the logo description
const LIGHT_LAVENDER = '#E6D5F7';
const DARK_PURPLE = '#4A148C';
const WHITE = '#FFFFFF';

export default function SplashScreen() {
  

    return (
      <View style={styles.container}>
        <Image source={require('../assets/images/app-logo.png')} style={styles.image} />
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'relative',
    marginBottom: 24,
  },
  segmentRow: {
    position: 'absolute',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segmentHalf: {
    width: '50%',
    height: '100%',
    position: 'relative',
  },
  horizontalSeparator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 1,
    backgroundColor: WHITE,
  },
  centerDivider: {
    width: 1,
    height: '100%',
    backgroundColor: WHITE,
    zIndex: 1,
  },
  text: {
    fontSize: 32,
    fontWeight: '700',
    color: DARK_PURPLE,
    fontFamily: 'system',
    letterSpacing: 0.5,
  },
});


