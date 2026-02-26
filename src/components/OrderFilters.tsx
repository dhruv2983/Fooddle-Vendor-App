import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { theme } from '@/constants/theme';

export type OrderStatus = 'pending' | 'received' | 'confirmed' | 'delivered' | 'cancelled';

interface OrderFiltersProps {
  selectedStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ selectedStatus, onStatusChange }) => {
  const filterOptions: { key: OrderStatus; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'received', label: 'Received' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              selectedStatus === option.key && styles.activeFilterButton,
            ]}
            onPress={() => onStatusChange(option.key)}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedStatus === option.key && styles.activeFilterText,
              ]}
            >
              {option.label}
            </ThemedText>
            {option.count !== undefined && (
              <View style={styles.countBadge}>
                <ThemedText style={styles.countText}>{option.count}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.s,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  activeFilterText: {
    color: theme.colors.white,
  },
  countBadge: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

export default OrderFilters;