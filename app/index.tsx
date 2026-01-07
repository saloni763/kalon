import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { isAuthenticated } from '@/utils/tokenStorage';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const authenticated = await isAuthenticated();
        setIsAuth(authenticated);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuth(false);
      } finally {
        setIsChecking(false);
      }
    }
    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuth) {
    return <Redirect href="/homepage/home" />;
  }

  return <Redirect href="/onboard/onboarding" />;
}
