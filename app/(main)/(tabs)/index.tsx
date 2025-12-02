import React, { useEffect, useCallback } from 'react';
import { StyleSheet, StatusBar, View, Switch, RefreshControl, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { useShopStore } from '@/store/shopStore';
import { theme } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';

import PendingOrders from '@/components/shop/PendingOrders';
import Menu from '@/components/shop/Menu';
import Stats from '@/components/shop/Stats';

const Tab = createMaterialTopTabNavigator();

const ShopScreen = () => {
  const { shopStatus, fetchShopStatus, toggleShopStatus, isLoading } = useShopStore();

  const loadShopStatus = useCallback(async () => {
    await fetchShopStatus();
  }, [fetchShopStatus]);

  const { isRefreshing, onRefresh } = useRefresh(loadShopStatus);

  useEffect(() => {
    loadShopStatus();
  }, [loadShopStatus]);

  const handleStatusToggle = async (newValue: boolean) => {
    if (!newValue) {
      // Going offline
      await toggleShopStatus('Temporarily closed');
    } else {
      // Going online
      await toggleShopStatus();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <Header 
        title="Shop Management"
        subtitle="Control your restaurant operations"
      />

      {/* Shop Status - Seamlessly Integrated */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <View style={styles.statusInfo}>
            <ThemedText style={[
              styles.statusText,
              shopStatus?.is_operating ? styles.statusOnline : styles.statusOffline
            ]}>
              {shopStatus?.is_operating ? 'Accepting Orders' : 'Shop Closed'}
            </ThemedText>
          </View>
          
          <View style={styles.statusToggle}>
            <Switch
              value={shopStatus?.is_operating || false}
              onValueChange={handleStatusToggle}
              trackColor={{
                false: '#FFE6E6',
                true: '#E8F5E8',
              }}
              thumbColor={shopStatus?.is_operating ? '#4CAF50' : '#F44336'}
              ios_backgroundColor="#FFE6E6"
              style={styles.switch}
            />
          </View>
        </View>
        
        <View style={styles.statusDivider} />
      </View>

      <View style={styles.tabContainer}>
        <Tab.Navigator
          swipeEnabled={false}
          tabBarPosition="top"
          initialLayout={{ width: 0 }}
          sceneContainerStyle={{ backgroundColor: 'transparent' }}
          screenOptions={{
            swipeEnabled: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.muted,
            tabBarIndicatorStyle: { 
              backgroundColor: theme.colors.primary,
              height: 3,
              borderRadius: theme.borderRadius.s,
            },
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'none',
            },
            tabBarPressColor: `${theme.colors.primary}15`,
            tabBarGestureEnabled: false,
          }}
        >
          <Tab.Screen 
            name="PendingOrders" 
            component={PendingOrders} 
            options={{ title: 'Orders' }} 
          />
          <Tab.Screen 
            name="Menu" 
            component={Menu} 
            options={{ title: 'Menu' }} 
          />
          <Tab.Screen 
            name="Stats" 
            component={Stats} 
            options={{ title: 'Analytics' }} 
          />
        </Tab.Navigator>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  statusSection: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
    fontWeight: '500' as const,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  statusOnline: {
    color: '#4CAF50',
  },
  statusOffline: {
    color: '#F44336',
  },
  statusToggle: {
    marginLeft: theme.spacing.l,
  },
  switch: {
    // Keep default size for professional look
  },
  statusDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.l,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
});

export default ShopScreen;