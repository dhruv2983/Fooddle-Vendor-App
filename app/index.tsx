import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Index() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect based on authentication status
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(main)/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 100); // Small delay to ensure navigation is ready

    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>Loading app...</ThemedText>
    </ThemedView>
  );
}
