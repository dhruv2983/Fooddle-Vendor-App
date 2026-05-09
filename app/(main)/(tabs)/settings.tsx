import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/authStore';
import { useShopStore } from '@/store/shopStore';
import { theme } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

const SettingsScreen = () => {
  const { logout, configList, fetchConfigurations, updateConfiguration } = useAuthStore();
  const { shopStatus, fetchShopStatus, toggleShopStatus } = useShopStore();

  const [updatingConfigKey, setUpdatingConfigKey] = useState<string | null>(null);
  const [isTogglingShop, setIsTogglingShop] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingConfigs, setIsFetchingConfigs] = useState(false);

  const syncAll = useCallback(async () => {
    await Promise.all([fetchConfigurations(), fetchShopStatus()]);
  }, []);

  useEffect(() => {
    const initialLoad = async () => {
      setIsFetchingConfigs(true);
      await syncAll();
      setIsFetchingConfigs(false);
    };
    initialLoad();
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await syncAll();
    setIsRefreshing(false);
  }, [syncAll]);

  const handleShopToggle = async (newValue: boolean) => {
    if (isTogglingShop) return;
    setIsTogglingShop(true);
    try {
      await toggleShopStatus(newValue ? undefined : 'Temporarily closed');
    } catch {
      Alert.alert('Error', 'Failed to update shop status. Please try again.');
    } finally {
      setIsTogglingShop(false);
    }
  };

  const handleConfigToggle = async (key: string, newValue: boolean) => {
    if (updatingConfigKey) return;
    setUpdatingConfigKey(key);
    try {
      await updateConfiguration(key, newValue);
    } catch {
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    } finally {
      setUpdatingConfigKey(null);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const isOperating = shopStatus?.is_operating ?? false;

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <Header title="Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Shop Status Card */}
        <ThemedText style={styles.sectionLabel}>SHOP</ThemedText>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: isOperating ? '#E8F5E9' : '#FEE8E8' }]}>
                <Ionicons
                  name="storefront-outline"
                  size={18}
                  color={isOperating ? '#388E3C' : '#F44336'}
                />
              </View>
              <View style={styles.rowInfo}>
                <ThemedText style={styles.rowLabel}>Shop Status</ThemedText>
                <ThemedText style={[styles.rowSubLabel, { color: isOperating ? '#388E3C' : '#F44336' }]}>
                  {isOperating ? 'Open for orders' : 'Closed'}
                </ThemedText>
              </View>
            </View>
            {isTogglingShop ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.switchPlaceholder} />
            ) : (
              <Switch
                value={isOperating}
                onValueChange={handleShopToggle}
                trackColor={{ false: '#FFE6E6', true: '#C8E6C9' }}
                thumbColor={isOperating ? '#388E3C' : '#F44336'}
                ios_backgroundColor="#FFE6E6"
              />
            )}
          </View>
        </View>

        {/* Configurations Card */}
        <ThemedText style={styles.sectionLabel}>CONFIGURATIONS</ThemedText>
        <View style={styles.card}>
          {isFetchingConfigs ? (
            <View style={styles.centeredRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <ThemedText style={styles.mutedText}>Loading…</ThemedText>
            </View>
          ) : configList.length === 0 ? (
            <View style={styles.centeredRow}>
              <ThemedText style={styles.mutedText}>No configurations available</ThemedText>
            </View>
          ) : (
            configList.map((config, index) => (
              <View key={config.key}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconWrap, { backgroundColor: config.is_enabled ? '#E3F2FD' : '#F5F5F5' }]}>
                      <Ionicons
                        name="options-outline"
                        size={18}
                        color={config.is_enabled ? theme.colors.primary : '#9E9E9E'}
                      />
                    </View>
                    <View style={styles.rowInfo}>
                      <ThemedText style={styles.rowLabel}>{config.label}</ThemedText>
                      <ThemedText style={[styles.rowSubLabel, { color: config.is_enabled ? theme.colors.primary : '#9E9E9E' }]}>
                        {config.is_enabled ? 'Enabled' : 'Disabled'}
                      </ThemedText>
                    </View>
                  </View>
                  {updatingConfigKey === config.key ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.switchPlaceholder} />
                  ) : (
                    <Switch
                      value={config.is_enabled}
                      onValueChange={(val) => handleConfigToggle(config.key, val)}
                      trackColor={{ false: '#E0E0E0', true: '#BBDEFB' }}
                      thumbColor={config.is_enabled ? theme.colors.primary : '#9E9E9E'}
                      ios_backgroundColor="#E0E0E0"
                    />
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Account Card */}
        <ThemedText style={styles.sectionLabel}>ACCOUNT</ThemedText>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEE8E8' }]}>
                <Ionicons name="log-out-outline" size={18} color="#F44336" />
              </View>
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    marginBottom: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rowSubLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchPlaceholder: {
    width: 51,
    alignItems: 'center',
  },
  centeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  mutedText: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F44336',
  },
});

export default SettingsScreen;
