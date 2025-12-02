import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useMenuStore } from '@/store/menuStore';
import { MenuItem as MenuItemType } from '@/types/menu';
import { theme } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import MenuItemCard from '@/components/MenuItemCard';
import MenuItemEditScreen from '@/screens/MenuItemEditScreen';

// Removed old MenuItem component - now using MenuItemCard

// Removed old edit form - now using MenuItemEditScreen

const Menu = () => {
  const { 
    menu, 
    isLoading, 
    fetchMenu, 
    loadMoreMenu,
    pagination,
    refreshAll 
  } = useMenuStore();
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);

  const loadMenu = useCallback(async () => {
    await refreshAll(); // Load menu and categories
  }, [refreshAll]);

  const { isRefreshing, onRefresh } = useRefresh(loadMenu);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleEditItem = (item: MenuItemType) => {
    setEditingItem(item);
  };

  const handleEditSuccess = () => {
    setEditingItem(null);
    // Refresh menu data to show updates
    loadMenu();
  };

  const handleEditCancel = () => {
    setEditingItem(null);
  };

  if (isLoading && (!Array.isArray(menu) || !menu.length)) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText variant="subtitle">Loading menu...</ThemedText>
      </View>
    );
  }

  // Process menu items from API response
  const validMenuItems = Array.isArray(menu) ? menu.filter(item => {
    // Handle both valid objects and invalid data
    if (!item || typeof item !== 'object' || !item.id) {
      console.warn('Invalid menu item detected:', item);
      return false;
    }
    return true;
  }) : [];

  if (editingItem) {
    return (
      <MenuItemEditScreen 
        item={editingItem} 
        onBack={handleEditCancel}
        onSuccess={handleEditSuccess}
      />
    );
  }

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNext && !isLoading) {
      loadMoreMenu();
    }
  }, [pagination.hasNext, isLoading, loadMoreMenu]);

  return (
    <View style={styles.container}>
      <FlatList
        data={validMenuItems}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <MenuItemCard 
            item={item} 
            onPress={handleEditItem}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          pagination.hasNext ? (
            <View style={styles.loadingMore}>
              <ThemedText variant="caption" style={styles.loadingText}>
                {isLoading ? 'Loading more items...' : 'Pull up to load more'}
              </ThemedText>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No menu items found
              </ThemedText>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    paddingBottom: theme.spacing.l,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  emptyContainer: {
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
  loadingMore: {
    padding: theme.spacing.l,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.muted,
    fontStyle: 'italic',
    fontSize: 14,
  },
});

export default Menu;