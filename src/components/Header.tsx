import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiService } from '@/api/api';
import { router } from 'expo-router';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuthStore();
  const [healthData, setHealthData] = useState<{ user: string; shop: string } | null>(null);
  const [showSideSheet, setShowSideSheet] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let cancelled = false;

    const fetchHealthData = async () => {
      try {
        const data = await apiService.healthCheck();
        if (!cancelled) {
          setHealthData({ user: data.user, shop: data.shop });
        }
      } catch (error) {
        if (!cancelled && user) {
          setHealthData({
            user: user.name,
            shop: user.shop?.name || 'Unknown Shop',
          });
        }
      }
    };

    fetchHealthData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleNavigateToSettings = () => {
    setShowSideSheet(false);
    router.push('/(main)/(tabs)/settings');
  };

  const toggleSideSheet = () => {
    setShowSideSheet(!showSideSheet);
  };

  const handleNavigateToBills = () => {
    setShowSideSheet(false);
    router.push('/(main)/(tabs)/bills');
  };

  const handleNavigateToSupport = () => {
    setShowSideSheet(false);
    router.push('/(main)/(tabs)/support');
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      <View style={styles.headerLeft}>
        <ThemedText variant="title" style={styles.headerTitle}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="caption" style={styles.headerSubtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>

      <View style={styles.userSection}>
        <TouchableOpacity style={styles.userAvatar} onPress={toggleSideSheet}>
          <ThemedText style={styles.userInitials}>
            {(healthData?.user || user?.name || 'User').charAt(0).toUpperCase()}
          </ThemedText>
        </TouchableOpacity>

        <Modal
          visible={showSideSheet}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSideSheet(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowSideSheet(false)}>
            <Pressable style={styles.sideSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sideSheetHeader}>
                <ThemedText style={styles.sideSheetTitle}>
                  {healthData?.user || user?.name || 'Vendor'}
                </ThemedText>
                <TouchableOpacity onPress={() => setShowSideSheet(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.menuItems}>
                {/* Menu Button */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setShowSideSheet(false); router.push('/(main)/(tabs)/menu'); }}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="restaurant-outline" size={20} color={theme.colors.text} />
                    <ThemedText style={styles.menuItemText}>Menu</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
                </TouchableOpacity>

                {/* Analytics Button */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => { setShowSideSheet(false); router.push('/(main)/(tabs)/analytics'); }}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="stats-chart-outline" size={20} color={theme.colors.text} />
                    <ThemedText style={styles.menuItemText}>Analytics</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
                </TouchableOpacity>

                {/* Bills Button */}
                <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToBills}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="card-outline" size={20} color={theme.colors.text} />
                    <ThemedText style={styles.menuItemText}>Bills</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
                </TouchableOpacity>

                {/* Support Button */}
                <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToSupport}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="help-circle-outline" size={20} color={theme.colors.text} />
                    <ThemedText style={styles.menuItemText}>Support</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
                </TouchableOpacity>

                {/* Settings Button */}
                <TouchableOpacity style={styles.menuItem} onPress={handleNavigateToSettings}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
                    <ThemedText style={styles.menuItemText}>Settings</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: theme.colors.muted,
    lineHeight: 18,
  },
  userSection: {
    position: 'relative',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sideSheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '60%',
  },
  sideSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sideSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  menuItems: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.background,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
});
