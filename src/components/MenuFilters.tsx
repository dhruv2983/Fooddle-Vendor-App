import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { theme } from '@/constants/theme';
import { MenuCategory } from '@/types/menu';

interface MenuFiltersProps {
  categories: MenuCategory[];
  selectedCategoryId?: number;
  visibilityFilter: 'all' | 'visible' | 'hidden';
  onCategoryChange: (categoryId?: number) => void;
  onVisibilityChange: (visibility: 'all' | 'visible' | 'hidden') => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  categories,
  selectedCategoryId,
  visibilityFilter,
  onCategoryChange,
  onVisibilityChange,
}) => {
  const visibilityOptions = [
    { key: 'all', label: 'All Items' },
    { key: 'visible', label: 'Visible' },
    { key: 'hidden', label: 'Hidden' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Visibility Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.filterSection}
      >
        <ThemedText style={styles.sectionTitle}>Status:</ThemedText>
        {visibilityOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              visibilityFilter === option.key && styles.activeFilterButton,
            ]}
            onPress={() => onVisibilityChange(option.key)}
          >
            <ThemedText
              style={[
                styles.filterText,
                visibilityFilter === option.key && styles.activeFilterText,
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.filterSection}
      >
        <ThemedText style={styles.sectionTitle}>Category:</ThemedText>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !selectedCategoryId && styles.activeFilterButton,
          ]}
          onPress={() => onCategoryChange(undefined)}
        >
          <ThemedText
            style={[
              styles.filterText,
              !selectedCategoryId && styles.activeFilterText,
            ]}
          >
            All Categories
          </ThemedText>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategoryId === category.id && styles.activeFilterButton,
            ]}
            onPress={() => onCategoryChange(category.id)}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedCategoryId === category.id && styles.activeFilterText,
              ]}
            >
              {category.name}
            </ThemedText>
            <View style={styles.countBadge}>
              <ThemedText style={styles.countText}>{category.item_count}</ThemedText>
            </View>
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
  filterSection: {
    marginBottom: theme.spacing.s,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.m,
    gap: theme.spacing.s,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
    marginRight: theme.spacing.s,
    alignSelf: 'center',
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

export default MenuFilters;