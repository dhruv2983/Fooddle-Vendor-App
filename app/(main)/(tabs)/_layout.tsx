import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HapticTab } from '@/components/haptic-tab';
import ScanTabButton from '@/components/ScanTabButton';
import { useOrderStore } from '@/store/orderStore';

const TabIcon = ({
  name,
  color,
  count,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  count: number;
}) => (
  <View>
    <Ionicons name={name} size={24} color={color} />
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </View>
    )}
  </View>
);

export default function TabLayout() {
  const orders = useOrderStore(s => s.orders);

  const pendingDelivery = orders.filter(
    o => o.type_delivery && (o.status === 'received' || o.status === 'confirmed')
  ).length;

  const pendingPickup = orders.filter(
    o => !o.type_delivery && (o.status === 'received' || o.status === 'confirmed')
  ).length;

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
            <TabIcon
              name={focused ? 'bicycle' : 'bicycle-outline'}
              color={color}
              count={pendingDelivery}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarButton: (props) => <ScanTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="pickup"
        options={{
          title: 'Pickup',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'bag-handle' : 'bag-handle-outline'}
              color={color}
              count={pendingPickup}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="order-details"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="bills"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="support"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="menu"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="settings"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
