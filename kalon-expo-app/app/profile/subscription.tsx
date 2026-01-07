import React, { useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { showToast } from '@/utils/toast';
import GemIcon from '@/components/ui/GemIcon';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

type PlanId = 'trial' | 'monthly' | 'yearly';

const heroImage = require('@/assets/images/subscription.png');

const perks = [
  'Priority Support',
  'Ad-Free Chat',
  'Exclusive Features',
  'Full History Access',
  'Early Access to New Tools',
];

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('trial');

  const hero = Image.resolveAssetSource(heroImage);
  const screenWidth = Dimensions.get('window').width;
  const heroHeight = hero?.width && hero?.height ? (screenWidth * hero.height) / hero.width : 260;

  const priceText = useMemo(() => {
    switch (selectedPlan) {
      case 'trial':
        return 'Free Trial';
      case 'monthly':
        return '$9.99/Month';
      case 'yearly':
        return '$110/Year';
      default:
        return 'Upgrade';
    }
  }, [selectedPlan]);

  const handleUpgrade = () => {
    showToast.success(`Selected: ${priceText}`);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="contain" />
          <LinearGradient
             // Lighter at the top: keep top mostly clear and push the white fade lower
             colors={['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.70)', '#FFFFFF']}
             locations={[0, 0.72, 1]}
            style={styles.heroFade}
            pointerEvents="none"
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <View style={styles.backCircle}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>Unlock the full experience.</Text>

          <View style={styles.perks}>
            {perks.map((p) => (
              <View key={p} style={styles.perkRow}>
                <View style={styles.perkIcon}>
                  <GemIcon width={12} height={12} color="#29AE18" />
                </View>
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            <PlanCard
              title="Free Trial"
              rightText="7 Days free"
              selected={selectedPlan === 'trial'}
              onPress={() => setSelectedPlan('trial')}
            />
            <PlanCard
              title="Monthly"
              rightText="$9.99/Month"
              selected={selectedPlan === 'monthly'}
              onPress={() => setSelectedPlan('monthly')}
            />
            <PlanCard
              title="Yearly"
              rightText="$110/Year"
              badge="Most Popular"
              selected={selectedPlan === 'yearly'}
              onPress={() => setSelectedPlan('yearly')}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <LinearGradient
            colors={['#AF7DFF', '#9D6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeGradient}
          >
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} activeOpacity={0.85}>
              <Text style={styles.upgradeText}>Upgrade Plan</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
}

function PlanCard({
  title,
  rightText,
  selected,
  onPress,
  badge,
}: {
  title: string;
  rightText: string;
  selected: boolean;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.planCard, selected && styles.planCardSelected]}
    >
      {!!badge && (
        <LinearGradient
          colors={['#7436D7', '#AF7DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badgeFloating}
          pointerEvents="none"
        >
          <Text style={styles.badgeText}>{badge}</Text>
        </LinearGradient>
      )}
      <View style={styles.planLeft}>
        <Text style={styles.planTitle}>{title}</Text>
      </View>

      <View style={styles.planRight}>
        <Text style={styles.planPrice}>{rightText}</Text>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 400
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
  },
  backCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 0,
    marginTop: -100,
    zIndex: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D0A1B',
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#4E4C57',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  perks: {
    marginTop: 6,
    gap: 10,
    marginBottom: 18,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EAF7EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perkText: {
    fontSize: 13,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_500Medium',
  },
  plans: {
    gap: 18,
    marginTop: 6,
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#EDE6FF',
    backgroundColor: '#F7F4FF',
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#AF7DFF',
    backgroundColor: '#F5EEFF',
  },
  planLeft: {
    flex: 1,
  },
  planTitle: {
    fontSize: 14,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
  },
  planRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planPrice: {
    fontSize: 12,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#C9B7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#AF7DFF',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#AF7DFF',
  },
  badgeFloating: {
    position: 'absolute',
    right: 30, // sits just left of the radio
    top: -10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  upgradeGradient: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  upgradeButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '700',
  },
});


