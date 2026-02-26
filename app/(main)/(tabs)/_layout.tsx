import { Tabs } from 'expo-router';
import React from 'react';
import { theme } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingHorizontal: 0,
          paddingBottom: 12,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarItemStyle: {
          flex: 1,
          paddingVertical: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Delivery',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'bicycle' : 'bicycle-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pickup"
        options={{
          title: 'Pickup',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'bag-handle' : 'bag-handle-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="order-details"
        options={{
          href: null, // Hide from tabs - this is the order details screen
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}
