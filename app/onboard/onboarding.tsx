import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import LineIcon from '@/components/ui/LineIcon';
import StarIcon from '@/components/ui/StarIcon';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingData = [
    {
      heading: 'Showcase Your Skills and Achievements',
      text: 'Connect with like-\nminded students and\nexperts',
    },
    {
      heading: 'Showcase Your Skills and Achievements',
      text: 'Explore and Seize Exciting\nCareer and Growth\nOpportunities',
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If on last step, navigate to login
      router.push('/auth/login');
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Dark Upper Section */}
      <View style={styles.darkSection}>
        <Image 
          source={require('@/assets/images/bglayer.png')} 
          style={styles.bgLayer} 
          resizeMode="cover"
        />
        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Star Icons */}
        <View style={styles.star1}>
          <StarIcon width={39} height={26} color="#FFFFFF" />
        </View>
        <View style={styles.star2}>
          <StarIcon width={39} height={26} color="#FFFFFF" />
        </View>

        {/* Four Oval Images */}
        <View style={styles.imagesContainer}>
          {/* Top-left image */}
          <View style={[styles.ovalImage, styles.image1]}>
            <Image 
              source={require('@/assets/images/initialpage3.png')} 
              style={styles.ovalImageContent}
              resizeMode="cover"
            />
          </View>
          
          {/* Top-right image */}
          <View style={[styles.ovalImage, styles.image2]}>
            <Image 
              source={require('@/assets/images/initialpage2.png')} 
              style={styles.ovalImageContent}
              resizeMode="cover"
            />
          </View>
          
          {/* Mid-left image */}
          <View style={[styles.ovalImage, styles.image3]}>
            <Image 
              source={require('@/assets/images/intialpage1.png')} 
              style={styles.ovalImageContent}
              resizeMode="cover"
            />
          </View>
          
          {/* Bottom-right image */}
          <View style={[styles.ovalImage, styles.image4]}>
            <Image 
              source={require('@/assets/images/initialpage4.png')} 
              style={styles.horizontalImageContent}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Yellow Wavy Line - Bottom Right */}
        <View style={styles.yellowWaveContainer}>
          <LineIcon width={92} height={8} color="#C2BA81" />
        </View>
      </View>

      {/* White Lower Section */}
      <View style={styles.whiteSection}>
        <Text style={styles.heading}>{onboardingData[currentStep].heading}</Text>
        <Text style={styles.mainText}>
          {onboardingData[currentStep].text}
        </Text>

        <View style={styles.bottomRow}>
          {/* Progress Indicators - Three bars */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, currentStep === 0 && styles.progressBarActive]} />
            <View style={[styles.progressBar, currentStep === 1 && styles.progressBarActive]} />
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Ionicons name="chevron-forward-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0D18',
  },
  darkSection: {
    flex: 0.65,
    backgroundColor: '#0F0D18',
    position: 'relative',
    overflow: 'hidden',
  },
  bgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  star1: {
    position: 'absolute',
    top: '15%',
    left: '42%',
    width: 39,
    height: 39,
    zIndex: 5,
  },
  star2: {
    position: 'absolute',
    bottom: '3%',
    left: '8%',
    width: 39,
    height: 39,
    zIndex: 5,
  },
  imagesContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  ovalImage: {
    position: 'absolute',
    borderRadius: 1000,
    overflow: 'hidden',
    backgroundColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  horizontalImageContent: {
    width: '100%',
    height: '100%',
  },
  ovalImageContent: {
    width: '100%',
    height: '100%',
  },
  image1: {
    width: 119,
    height: 163,
    top: '12%',
    left: '6%',
  },
  image2: {
    width: 186,
    height: 260,
    top: '15%',
    right: '5%',
  },
  image3: {
    width: 145,
    height: 190,
    top: '52%',
    left: '5%',
  },
  image4: {
    width: 165,
    height: 85,
    bottom: '12%',
    right: '10%',
  },
  yellowWaveContainer: {
    position: 'absolute',
    bottom: '5%',
    right: '0%',
    zIndex: 3,
  },
  whiteSection: {
    flex: 0.35,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'space-between',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  heading: {
    fontSize: 18,
    color: '#0D0A1B',
    lineHeight: 22,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 16,
  },
  mainText: {
    fontSize: 28,
    color: '#0D0A1B',
    lineHeight: 39,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'left',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#AF7DFF33',
    marginRight: 8,
  },
  progressBarActive: {
    backgroundColor: '#AF7DFF',
    width: 32,
  },
  nextButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#AF7DFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
