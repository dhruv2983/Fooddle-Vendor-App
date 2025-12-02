import { useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { user, checkAuth } = useAuthStore();
  const isAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    // Check authentication on app start
    checkAuth();
  }, []);

  useEffect(() => {
    // Don't run if navigation isn't ready
    if (!navigationState?.key) return;

    // Don't run if segments are not ready yet
    if (!segments[0]) return;

    // Only redirect if we're in the wrong section
    if (!user && !isAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && isAuthGroup) {
      router.replace('/(main)/(tabs)');
    }
  }, [user, segments, isAuthGroup, navigationState, router]);
}
