import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold, Montserrat_900Black } from '@expo-google-fonts/montserrat';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import SplashScreenComponent from '@/components/splash-screen';
import { RootStack } from './navigation/stacks';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/utils/toastConfig';
import { checkAuthStatus } from '@/utils/authCheck';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load before proceeding
        if (fontsLoaded) {
          // Check for saved authentication token and restore session
          await checkAuthStatus();
          
          // Hide native splash screen
          await SplashScreen.hideAsync();
          
          // Show custom splash screen for 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          setIsAppReady(true);
          
          // Fade out custom splash screen after a short delay
          setTimeout(() => {
            setShowSplash(false);
          }, 300);
        }
      } catch (e) {
        console.warn(e);
        setIsAppReady(true);
        setShowSplash(false);
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded || !isAppReady || showSplash) {
    return (
      <View style={{ flex: 1 }}>
        <SplashScreenComponent />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootStack />
        <StatusBar style="auto" />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </QueryClientProvider>
    </SafeAreaProvider>
  );
}
