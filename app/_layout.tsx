import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { StatusBar } from 'expo-status-bar';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen once the root component has mounted.
    SplashScreen.hideAsync();
  }, []);

  useProtectedRoute();

  return (
    <ThemeProvider value={DefaultTheme}>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
