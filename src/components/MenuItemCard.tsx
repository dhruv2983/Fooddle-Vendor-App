import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MenuItem as MenuItemType } from '@/types/menu';
import { theme } from '@/constants/theme';
import { formatPrice, formatCurrency } from '@/utils/priceHelpers';

interface MenuItemCardProps {
  item: MenuItemType;
  onPress: (item: MenuItemType) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onPress }) => {
  // Handle API response data mapping
  const displayPrice = formatPrice(item.price);
  const isVisible = item.visible;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Category */}
        <View style={styles.categorySection}>
          <ThemedText style={styles.categoryText}>
            {item.category_name || 'Uncategorized'}
          </ThemedText>
        </View>
        
        {/* Item Name */}
        <View style={styles.nameSection}>
          <ThemedText style={styles.itemName} numberOfLines={2}>
            {item.name}
          </ThemedText>
        </View>
        
        {/* Visibility Dot */}
        <View style={styles.visibilitySection}>
          <View style={[styles.visibilityDot, isVisible ? styles.visibleDot : styles.hiddenDot]} />
        </View>
        
        {/* Price */}
        <View style={styles.priceSection}>
          <ThemedText style={styles.currentPrice}>
            {formatCurrency(displayPrice)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    marginHorizontal: theme.spacing.m,
    marginVertical: theme.spacing.s,
    borderWidth: 1,
    borderColor: '#E8EEF7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  categorySection: {
    flex: 2,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5A8BC7',
    textTransform: 'capitalize',
  },
  nameSection: {
    flex: 3,
    paddingHorizontal: theme.spacing.s,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D5A87',
    lineHeight: 20,
  },
  visibilitySection: {
    flex: 0.5,
    alignItems: 'center',
  },
  visibilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  visibleDot: {
    backgroundColor: '#4CAF50',
  },
  hiddenDot: {
    backgroundColor: '#9E9E9E',
  },
  priceSection: {
    flex: 2,
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A87',
  },
});

export default MenuItemCard;