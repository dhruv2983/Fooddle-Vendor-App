import React, { useEffect, useCallback, useState, memo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types/orders';
import { theme } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import OrderFilters, { OrderStatus } from '@/components/OrderFilters';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PendingOrdersProps {
  searchQuery?: string;
  orderType: 'delivery' | 'pickup';
}

const PendingOrders: React.FC<PendingOrdersProps> = ({ searchQuery = '', orderType }) => {
  const {
    orders,
    isLoading,
    fetchOrders,
    updateOrderStatus,
    loadMoreOrders,
    pagination
  } = useOrderStore();

  const configurations = useAuthStore((state) => state.configurations);
  const skipOrderConfirmation = configurations?.skip_order_confirmation?.is_enabled ?? false;

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadOrders = useCallback(async () => {
    const filters: Parameters<typeof fetchOrders>[0] = { status: selectedStatus };
    if (debouncedSearch) filters.shop_daily_serial = debouncedSearch;
    await fetchOrders(filters);
  }, [selectedStatus, debouncedSearch]);

  const { isRefreshing, onRefresh } = useRefresh(loadOrders);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, debouncedSearch]);

  const handleStatusChange = useCallback((status: OrderStatus) => {
    setSelectedStatus(status);
  }, []);

  const ordersArray = Array.isArray(orders) ? orders : [];

  // Filter by status, order type (delivery/pickup), and search query
  const filteredOrders = ordersArray.filter(order => {
    if (orderType === 'delivery' && !order.type_delivery) return false;
    if (orderType === 'pickup' && order.type_delivery) return false;
    return true;
  });

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: 'confirmed' });
      loadOrders();
    } catch {
      Alert.alert('Error', 'Failed to accept order. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: 'cancelled', reason: 'Order cancelled by vendor' });
      loadOrders();
    } catch {
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    }
  };

  const handleDeliverOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, { status: 'delivered' });
      loadOrders();
    } catch {
      Alert.alert('Error', 'Failed to mark order as delivered. Please try again.');
    }
  };

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNext && !isLoading) {
      loadMoreOrders();
    }
  }, [pagination.hasNext, isLoading]);

  const handleOrderPress = (orderId: string) => {
    router.push(`/(main)/(tabs)/order-details?orderId=${orderId}`);
  };

  const renderOrderCard = useCallback(({ item }: { item: Order }) => (
    <OrderCard
      item={item}
      onPress={() => handleOrderPress(item.id.toString())}
      onAccept={() => handleAcceptOrder(item.id.toString())}
      onCancel={() => handleCancelOrder(item.id.toString())}
      onDeliver={() => handleDeliverOrder(item.id.toString())}
      skipOrderConfirmation={skipOrderConfirmation}
    />
  ), [handleOrderPress, handleAcceptOrder, handleCancelOrder, handleDeliverOrder, skipOrderConfirmation]);

  const keyExtractor = useCallback((item: Order) => `order-${item.id}`, []);

  const ListEmptyComponent = useCallback(() => (
    !isLoading ? (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle" size={96} color={theme.colors.primary} style={styles.emptyIcon} />
        <ThemedText style={styles.emptyTitle}>
          {selectedStatus === 'pending'
            ? `All clear! No pending ${orderType} orders`
            : `No ${selectedStatus} ${orderType} orders`}
        </ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          New orders will appear here
        </ThemedText>
      </View>
    ) : null
  ), [isLoading, selectedStatus, orderType]);

  const ListFooterComponent = useCallback(() => (
    isLoading && filteredOrders.length > 0 ? (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ) : null
  ), [isLoading, filteredOrders.length]);

  const isInitialLoading = isLoading && filteredOrders.length === 0 && !isRefreshing;

  return (
    <View style={styles.container}>
      <OrderFilters
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />
      {isInitialLoading ? (
        <View style={styles.fullscreenLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.listContainer}
          contentContainerStyle={[styles.listContent, filteredOrders.length === 0 && styles.listContentEmpty]}
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
        />
      )}
    </View>
  );
};

const OrderCard = memo(({
  item,
  onPress,
  onAccept,
  onCancel,
  onDeliver,
  skipOrderConfirmation,
}: {
  item: Order;
  onPress: () => void;
  onAccept: () => void;
  onCancel: () => void;
  onDeliver: () => void;
  skipOrderConfirmation: boolean;
}) => {
  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':  return '#F57C00';
      case 'confirmed': return '#1976D2';
      case 'delivered': return '#388E3C';
      case 'cancelled': return '#D32F2F';
      default:          return theme.colors.muted;
    }
  };

  const renderActionButtons = () => {
    const status = item.status.toLowerCase();

    if (status === 'received') {
      return (
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            size="small"
            style={[styles.actionButton, styles.cancelButton]}
          />
          <Button
            title={skipOrderConfirmation ? 'Deliver' : 'Accept'}
            onPress={skipOrderConfirmation ? onDeliver : onAccept}
            variant="primary"
            size="small"
            style={[styles.actionButton, styles.acceptButton]}
          />
        </View>
      );
    }

    if (status === 'confirmed') {
      return (
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            size="small"
            style={[styles.actionButton, styles.cancelButton]}
          />
          <Button
            title="Deliver"
            onPress={onDeliver}
            variant="primary"
            size="small"
            style={[styles.actionButton, styles.acceptButton]}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdSection}>
          <ThemedText style={styles.orderId}>#{item.shop_daily_serial ?? item.id}</ThemedText>
        </View>
        <View style={styles.customerSection}>
          <ThemedText style={styles.customerName} numberOfLines={1}>
            {item.customer_name}
          </ThemedText>
        </View>
        <View style={styles.statusSection}>
          <View style={styles.statusBadge}>
            <ThemedText style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.amountSection}>
          <ThemedText style={styles.amount}>
            ₹{parseFloat(item.amount as any || 0).toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {item.items && item.items.length > 0 && (
        <View style={styles.itemsContainer}>
          {item.items.map((orderItem, index) => (
            <ThemedText key={index} style={styles.itemText} numberOfLines={1}>
              {orderItem.item_name} × {orderItem.qty}
            </ThemedText>
          ))}
        </View>
      )}

      {renderActionButtons()}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.status === nextProps.item.status &&
         prevProps.item.amount === nextProps.item.amount &&
         prevProps.skipOrderConfirmation === nextProps.skipOrderConfirmation;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 150,
  },
  fullscreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdSection: {
    width: '15%',
    maxWidth: 50,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.muted,
  },
  customerSection: {
    flex: 1,
    paddingHorizontal: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusSection: {
    marginHorizontal: 8,
    minWidth: 70,
  },
  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  amountSection: {
    width: 80,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  acceptButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  itemsContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  itemText: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 4,
  },
});

export default PendingOrders;
