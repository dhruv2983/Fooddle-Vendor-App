import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useMenuStore } from '@/store/menuStore';
import { MenuItem as MenuItemType, MenuVariant } from '@/types/menu';
import { theme } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import MenuItemCard from '@/components/MenuItemCard';
import MenuItemEditScreen from '@/screens/MenuItemEditScreen';
import ProductRequests from '@/components/shop/ProductRequests';
import Ionicons from '@expo/vector-icons/Ionicons';

type Tab = 'products' | 'requests';

interface CategoryGroup {
  name: string;
  items: MenuItemType[];
}

function groupByCategory(items: MenuItemType[]): CategoryGroup[] {
  const map: Record<string, MenuItemType[]> = {};
  for (const item of items) {
    const cat = item.category_name || 'Uncategorized';
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => ({ name, items }));
}

const Menu = () => {
  const { menu, isLoading, refreshAll } = useMenuStore();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [editing, setEditing] = useState<{ item: MenuItemType; variant: MenuVariant } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  const loadMenu = useCallback(async () => {
    await refreshAll();
  }, []);

  const { isRefreshing, onRefresh } = useRefresh(loadMenu);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleProduct = (productId: number) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const handleEditSuccess = () => {
    setEditing(null);
    loadMenu();
  };

  if (editing) {
    return (
      <MenuItemEditScreen
        item={editing.item}
        variant={editing.variant}
        onBack={() => setEditing(null)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  const validItems = Array.isArray(menu) ? menu.filter(i => i && i.id) : [];
  const categories = groupByCategory(validItems);

  const renderProducts = () => {
    if (isLoading && validItems.length === 0) {
      return (
        <View style={styles.centered}>
          <ThemedText variant="subtitle">Loading menu...</ThemedText>
        </View>
      );
    }

    if (!isLoading && validItems.length === 0) {
      return (
        <View style={styles.centered}>
          <ThemedText style={styles.emptyText}>No menu items found</ThemedText>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {categories.map(({ name, items }) => {
          const isOpen = expandedCategories.has(name);
          const visibleCount = items.filter(i => i.visible).length;

          return (
            <View key={name} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(name)}
                activeOpacity={0.75}
              >
                <View style={styles.categoryLeft}>
                  <ThemedText style={styles.categoryName}>{name}</ThemedText>
                  <ThemedText style={styles.categoryMeta}>
                    {items.length} {items.length === 1 ? 'product' : 'products'} · {visibleCount} visible
                  </ThemedText>
                </View>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.productList}>
                  {items.map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      expanded={expandedProducts.has(item.id)}
                      onToggle={() => toggleProduct(item.id)}
                      onEdit={(item, variant) => setEditing({ item, variant })}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['products', 'requests'] as Tab[]).map(tab => {
          const isActive = activeTab === tab;
          const label = tab === 'products' ? 'Products' : 'Requests';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <ThemedText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {label}
              </ThemedText>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      {activeTab === 'products' ? renderProducts() : <ProductRequests />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0EAF5',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabItemActive: {},
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.muted,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },

  // Products tab
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.m,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Category card
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: '#E0EAF5',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 14,
  },
  categoryLeft: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },
  categoryMeta: {
    fontSize: 12,
    color: theme.colors.muted,
  },

  // Product list inside category
  productList: {
    borderTopWidth: 1,
    borderTopColor: '#E0EAF5',
  },
});

export default Menu;
