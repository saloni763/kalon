import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLogout } from '@/hooks/queries/useAuth';
import BackArrowCircleIcon from '@/components/ui/BackArrowCircleIcon';

export default function EditProfileScreen() {
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleOptionPress = (option: string) => {
    switch (option) {
      case 'Personal Info':
        router.push('/profile/personal-info' as any);
        break;
      case 'Social Network':
        router.push('/profile/social-network' as any);
        break;
      case 'Education & Role':
        router.push('/profile/education-role' as any);
        break;
      case 'Skills & Interests':
        router.push('/profile/skills-interests' as any);
        break;
      case 'Notifications':
        router.push('/profile/notifications' as any);
        break;
      case 'Saved':
        // TODO: Navigate to Saved screen
        router.push('/profile/saved' as any);
        break;
      case 'Subscription':
        router.push('/profile/subscription' as any);
        break;
      case 'Privacy':
        router.push('/profile/privacy-settings' as any);
        break;
      default:
        console.log('Navigate to:', option);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackArrowCircleIcon width={26} height={26} color="#0D0A1B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.divider} />

        {/* Scrollable Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* My Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Account</Text>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Personal Info')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Personal Info</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Social Network')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Social Network</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* About Me Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Education & Role')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="menu" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Education & Role</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Skills & Interests')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="sparkles" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Skills & Interests</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Saved')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="bookmark" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Saved</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Membership Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership</Text>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Subscription')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="star-outline" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Subscription</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Others Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Others</Text>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Notifications')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Notifications</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('Privacy')}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-checkmark" size={20} color="#AF7DFF" />
                </View>
                <Text style={styles.optionText}>Privacy</Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons name="chevron-forward" size={20} color="#AF7DFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Logout Option */}
          <TouchableOpacity
            style={styles.logoutOption}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconContainer}>
              <Ionicons name="power" size={20} color="#FF3B30" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D0A1B',
    fontFamily: 'sans-serif',
  },
  headerSpacer: {
    width: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D0A1B',
    marginBottom: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#0D0A1B',
    fontFamily: 'Montserrat_400Regular',
  },
  logoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontFamily: 'Montserrat_400Regular',
  },
});

