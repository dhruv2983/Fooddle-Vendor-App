import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiService } from '@/api/api';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuthStore();
  const [healthData, setHealthData] = useState<{ user: string; shop: string } | null>(null);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const data = await apiService.healthCheck();
        setHealthData({ user: data.user, shop: data.shop });
      } catch (error) {
        console.log('Failed to fetch health data:', error);
        // Fallback to stored user data
        if (user) {
          setHealthData({ 
            user: user.name, 
            shop: user.shop?.name || 'Unknown Shop' 
          });
        }
      }
    };

    fetchHealthData();
  }, [user]);

  const handleLogout = () => {
    setShowLogoutMenu(false);
    logout();
  };

  const toggleLogoutMenu = () => {
    setShowLogoutMenu(!showLogoutMenu);
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
        <TouchableOpacity style={styles.userAvatar} onPress={toggleLogoutMenu}>
          <ThemedText style={styles.userInitials}>
            {(healthData?.user || user?.name || 'User').charAt(0).toUpperCase()}
          </ThemedText>
        </TouchableOpacity>
        
        {showLogoutMenu && (
          <View style={styles.logoutMenu}>
            <TouchableOpacity style={styles.logoutMenuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
        )}
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
  logoutMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 120,
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutText: {
    marginLeft: 8,
    color: theme.colors.error,
    fontWeight: '500',
  },
});