import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Urbanist-Regular': Urbanist_400Regular,
    'Urbanist-Medium': Urbanist_500Medium,
    'Urbanist-SemiBold': Urbanist_600SemiBold,
    'Urbanist-Bold': Urbanist_700Bold,
  });

  useEffect(() => {
    // Hide the splash screen once the root component has mounted and fonts are loaded.
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useProtectedRoute();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
