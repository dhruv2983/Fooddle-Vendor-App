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
          paddingHorizontal: 0, // Remove horizontal padding
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          flex: 1, // Make each tab take equal space
          paddingVertical: 8,
        },
      }}>
      <Tabs.Screen
        name="order-details"
        options={{
          title: 'Order',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'receipt' : 'receipt-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'storefront' : 'storefront-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: 'Bills',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'card' : 'card-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'help-circle' : 'help-circle-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
