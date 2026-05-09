import React, { useState } from 'react';
import { StyleSheet, StatusBar, View, TextInput } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { theme } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import PendingOrders from '@/components/shop/PendingOrders';

const PickupOrdersScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <Header
        title="Orders"
        subtitle="Pickup orders"
      />

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.muted}
            keyboardType="numeric"
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.muted}
              onPress={() => setSearchQuery('')}
              style={styles.clearIcon}
            />
          )}
        </View>
      </View>

      <PendingOrders searchQuery={searchQuery} orderType="pickup" />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  searchSection: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
  },
  clearIcon: {
    marginLeft: 8,
  },
});

export default PickupOrdersScreen;
