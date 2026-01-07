import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/queries/useAuth';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

export default function SocialNetworkScreen() {
  const user = useUser();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Social Network</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scrollable Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Google Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Google</Text>
            
            <View style={styles.accountItem}>
              <View style={styles.accountLeft}>
                <View style={styles.googleLogoContainer}>
                  <View style={styles.googleLogo}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                </View>
                <Text style={styles.accountEmail}>{user?.email || 'Jengeorz@gmail.com'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </View>
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
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'Montserrat_700Bold',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  accountItem: {
    paddingVertical: 12,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleLogoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
  },
  accountEmail: {
    fontSize: 14,
    color: '#4E4C57',
    fontFamily: 'Montserrat_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 12,
  },
});

