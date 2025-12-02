import React, { useEffect, useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useOrderStore } from '@/store/orderStore';
import { Order } from '@/types/orders';
import { theme } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import OrderFilters, { OrderStatus } from '@/components/OrderFilters';

const PendingOrders = () => {
  const { 
    orders, 
    isLoading, 
    fetchOrders, 
    updateOrderStatus, 
    loadMoreOrders,
    pagination 
  } = useOrderStore();
  
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');

  const loadOrders = useCallback(async () => {
    const filters = selectedStatus === 'all' ? {} : { status: selectedStatus as any };
    await fetchOrders(filters);
  }, [fetchOrders, selectedStatus]);

  const { isRefreshing, onRefresh } = useRefresh(loadOrders);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, selectedStatus]);

  const handleStatusChange = useCallback((status: OrderStatus) => {
    setSelectedStatus(status);
  }, []);

  const ordersArray = Array.isArray(orders) ? orders : [];
  
  // Filter orders based on selected status
  const filteredOrders = selectedStatus === 'all' 
    ? ordersArray 
    : ordersArray.filter(order => order.status === selectedStatus);

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, { status: 'confirmed' });
  };

  const handleCancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, { status: 'cancelled', reason: 'Order cancelled by vendor' });
  };

  const handleDeliverOrder = (orderId: string) => {
    updateOrderStatus(orderId, { status: 'delivered' });
  };

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNext && !isLoading) {
      loadMoreOrders();
    }
  }, [pagination.hasNext, isLoading, loadMoreOrders]);

  const handleOrderPress = (orderId: string) => {
    // Navigate to order details page and pass the order ID
    router.push(`/(main)/(tabs)/order-details?orderId=${orderId}`);
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <OrderCard 
      item={item} 
      onPress={() => handleOrderPress(item.id.toString())}
      onAccept={() => handleAcceptOrder(item.id.toString())}
      onCancel={() => handleCancelOrder(item.id.toString())}
      onDeliver={() => handleDeliverOrder(item.id.toString())}
    />
  );

  return (
    <View style={styles.container}>
      <OrderFilters
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />
      <FlatList
        style={styles.listContainer}
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <ThemedText variant="subtitle" style={styles.emptyTitle}>
                {selectedStatus === 'all' ? 'No orders found' : `No ${selectedStatus} orders found`}
              </ThemedText>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText variant="caption" style={styles.loadingText}>
                {isLoading ? 'Loading orders...' : 'Pull up to load more'}
              </ThemedText>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const OrderCard = ({ 
  item, 
  onPress,
  onAccept, 
  onCancel, 
  onDeliver 
}: { 
  item: Order;
  onPress: () => void; 
  onAccept: () => void;
  onCancel: () => void;
  onDeliver: () => void;
}) => {
  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
        return '#F57C00'; // Orange
      case 'confirmed':
        return '#1976D2'; // Blue
      case 'delivered':
        return '#388E3C'; // Green
      case 'cancelled':
        return '#D32F2F'; // Red
      default:
        return theme.colors.muted;
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
            title="Accept"
            onPress={onAccept}
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

    // Terminal states - no buttons shown
    return null;
  };

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      {/* Order Header: ID | Customer | Status | Amount */}
      <View style={styles.orderHeader}>
        <View style={styles.orderIdSection}>
          <ThemedText style={styles.orderId}>#{item.id}</ThemedText>
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
            ₹{item.grand_total?.toFixed(2) || item.total?.toFixed(2) || '0.00'}
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      {renderActionButtons()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16, // Add margin at top to separate from filters
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    textAlign: 'center',
    color: theme.colors.muted,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.muted,
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
    // Override colors for cancel button (blue border, white bg, blue text)
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  acceptButton: {
    // Override colors for accept/deliver button (blue border, blue bg, white text)
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
});

export default PendingOrders;