import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MenuItem as MenuItemType, MenuVariant } from '@/types/menu';
import { theme } from '@/constants/theme';
import { formatCurrency } from '@/utils/priceHelpers';
import Ionicons from '@expo/vector-icons/Ionicons';

interface MenuItemCardProps {
  item: MenuItemType;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (item: MenuItemType, variant: MenuVariant) => void;
}

const VisibilityDot = ({ visible }: { visible: boolean }) => (
  <View style={[styles.dot, visible ? styles.dotVisible : styles.dotHidden]} />
);

const VariantRow = ({
  variant,
  onPress,
}: {
  variant: MenuVariant;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.variantRow} onPress={onPress} activeOpacity={0.65}>
    <VisibilityDot visible={variant.visible} />
    <ThemedText style={styles.variantName} numberOfLines={1}>
      {variant.name}
    </ThemedText>
    <ThemedText style={styles.variantPrice}>
      {formatCurrency(parseFloat(variant.price) || 0)}
    </ThemedText>
    <Ionicons name="chevron-forward" size={14} color={theme.colors.muted} />
  </TouchableOpacity>
);

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, expanded, onToggle, onEdit }) => {
  const variants = item.variants ?? [];
  const isSingleVariant = variants.length <= 1;
  const defaultVariant = variants.find(v => v.is_default) ?? variants[0];

  if (isSingleVariant) {
    return (
      <TouchableOpacity style={styles.singleRow} onPress={() => defaultVariant && onEdit(item, defaultVariant)} activeOpacity={0.65}>
        <VisibilityDot visible={item.visible} />
        <ThemedText style={styles.productName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        {defaultVariant && (
          <ThemedText style={styles.singlePrice}>
            {formatCurrency(parseFloat(defaultVariant.price) || 0)}
          </ThemedText>
        )}
        <Ionicons name="chevron-forward" size={14} color={theme.colors.muted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.multiCard}>
      <TouchableOpacity style={styles.productHeader} onPress={onToggle} activeOpacity={0.7}>
        <VisibilityDot visible={item.visible} />
        <ThemedText style={styles.productName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.variantCountBadge}>
          {variants.length} variants
        </ThemedText>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.muted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.variantList}>
          {variants.map(variant => (
            <VariantRow
              key={variant.id}
              variant={variant}
              onPress={() => onEdit(item, variant)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Single-variant flat row
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FA',
  },

  // Multi-variant collapsible card
  multiCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FA',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 12,
    gap: 8,
  },

  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5A87',
  },
  variantCountBadge: {
    fontSize: 11,
    color: theme.colors.muted,
    backgroundColor: '#F0F4FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  singlePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5A87',
  },

  // Variant rows (inside expanded product)
  variantList: {
    backgroundColor: '#F8FAFD',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F8',
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },
  variantName: {
    flex: 1,
    fontSize: 13,
    color: '#4A6D8C',
  },
  variantPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D5A87',
  },

  // Shared
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  dotVisible: {
    backgroundColor: '#4CAF50',
  },
  dotHidden: {
    backgroundColor: '#BDBDBD',
  },
});

export default MenuItemCard;
