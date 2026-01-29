import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { Header } from '@/components/Header';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useOrderStore } from '@/store/orderStore';
import { Order } from '@/types/orders';
import { theme } from '@/constants/theme';
import { validateOrderId } from '@/utils/validation';
import { apiService } from '@/api/api';
import { log } from '@/utils/logger';

// Helper function to get status-specific styles
const getStatusStyle = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'received':
      return { backgroundColor: '#F57C00' }; // Orange
    case 'confirmed':
      return { backgroundColor: '#1976D2' }; // Blue
    case 'delivered':
      return { backgroundColor: '#388E3C' }; // Green
    case 'cancelled':
      return { backgroundColor: '#D32F2F' }; // Red
    default:
      return { backgroundColor: theme.colors.muted };
  }
};

const OrderDetailsScreen = () => {
  const params = useLocalSearchParams();
  const incomingOrderId = params.orderId as string;
  
  const [orderId, setOrderId] = useState<string>(incomingOrderId || '');
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isGeneratingBill, setIsGeneratingBill] = useState<boolean>(false);
  const { updateOrderStatus } = useOrderStore();

  // Auto-search if orderId is provided via navigation
  useEffect(() => {
    if (incomingOrderId && incomingOrderId.trim()) {
      // Set the order ID and trigger search automatically
      setOrderId(incomingOrderId.trim());
      // Small delay to ensure state is updated before search
      setTimeout(() => {
        performSearch(incomingOrderId.trim());
      }, 100);
    }
  }, [incomingOrderId]);

  const performSearch = async (searchOrderId: string) => {
    // Skip validation for auto-triggered searches from navigation
    setValidationError('');
    setIsSearching(true);
    setHasSearched(false);

    try {
      // ALWAYS fetch fresh data from API - never use cached data
      // Add timestamp to bypass any caching mechanisms
      const orderData = await apiService.getOrderById(searchOrderId);
      log.debug('Order data received (fresh from API):', orderData);
      
      if (orderData && orderData.id) {
        setOrder(orderData);
      } else {
        setOrder(undefined);
        Alert.alert('Order Not Found', `No order found with Order ID: ${searchOrderId}. Please check the order number and try again.`);
      }
      setHasSearched(true);
    } catch (error) {
      log.error('Error fetching order', error);
      setOrder(undefined);
      setHasSearched(true);
      Alert.alert('Error', 'Failed to fetch order details. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchOrder = async () => {
    // Validate input only for manual searches
    if (!incomingOrderId) {
      const validation = validateOrderId(orderId);
      if (!validation.isValid) {
        setValidationError(validation.error || '');
        return;
      }
    }

    await performSearch(orderId.trim());
  };

  const handleAcceptOrder = async () => {
    if (order) {
      try {
        await updateOrderStatus(order.id.toString(), { status: 'confirmed' });
        setOrder({ ...order, status: 'confirmed', is_confirmed: true });
        Alert.alert('Success', `Order ${order.id} has been accepted and confirmed`);
      } catch (error) {
        Alert.alert('Error', 'Failed to accept order. Please try again.');
      }
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (order) {
      try {
        await updateOrderStatus(order.id.toString(), { status: 'cancelled', reason: 'Cancelled by vendor' });
        setOrder({ ...order, status: 'cancelled', is_cancelled: true });
        setShowCancelModal(false);
        Alert.alert('Success', `Order ${order.id} has been cancelled`);
      } catch (error) {
        Alert.alert('Error', 'Failed to cancel order. Please try again.');
      }
    }
  };

  const handleDeliverOrder = async () => {
    if (order) {
      try {
        await updateOrderStatus(order.id.toString(), { status: 'delivered' });
        setOrder({ ...order, status: 'delivered' });
        Alert.alert('Success', `Order ${order.id} has been marked as delivered`);
      } catch (error) {
        Alert.alert('Error', 'Failed to update order status. Please try again.');
      }
    }
  };

  const handleGenerateBill = async () => {
    if (!order) return;

    setIsGeneratingBill(true);
    try {
      // Call the generate bill API
      const response = await fetch(`https://fooddle.in/api/vendors/v1/generate-bill/?entity_type=order&entity_id=${order.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic bWFuYW4wMzpldnZvNTg1OA==', // You should get this from your auth store
          'Accept': 'application/json',
        },
      });

      const billData = await response.json();
      
      if (billData.download_url) {
        const fullDownloadUrl = `https://fooddle.in${billData.download_url}`;
        
        // Open the PDF directly in browser/default PDF viewer
        const supported = await Linking.canOpenURL(fullDownloadUrl);
        if (supported) {
          await Linking.openURL(fullDownloadUrl);
          Alert.alert('Success', 'Bill downloaded successfully!');
        } else {
          Alert.alert('Download URL', `Bill generated: ${fullDownloadUrl}`);
        }
      } else {
        Alert.alert('Error', 'Failed to generate bill. Please try again.');
      }
    } catch (error) {
      log.error('Error generating bill', error);
      Alert.alert('Error', 'Failed to generate bill. Please try again.');
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const handleNewSearch = () => {
    setOrder(undefined);
    setHasSearched(false);
    setOrderId('');
    setValidationError('');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      <Header 
        title="Order Details Lookup"
        subtitle="Enter an order ID to view and manage orders"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {!order && (
          <View style={styles.searchSection}>
            <View style={styles.instructionCard}>
              <ThemedText variant="title" style={styles.instructionTitle}>
                Find Your Order
              </ThemedText>
              <ThemedText variant="body" style={styles.instructionText}>
                Enter the order number below to view order details and manage the order status
              </ThemedText>
            </View>
            
            <View style={styles.searchCard}>
              <TextInput
                label="Order Number"
                placeholder="Enter order number..."
                value={orderId}
                onChangeText={setOrderId}
                keyboardType="numeric"
                error={validationError}
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={handleSearchOrder}
                enablesReturnKeyAutomatically={true}
              />
              <Button
                title={isSearching ? 'Searching...' : 'Find Order'}
                onPress={handleSearchOrder}
                disabled={isSearching || !orderId.trim()}
                variant="primary"
                size="large"
              />
            </View>
          </View>
        )}

        {hasSearched && !order && (
          <View style={styles.notFoundCard}>
            <ThemedText variant="title" style={styles.notFoundTitle}>
              Order Not Found
            </ThemedText>
            <ThemedText variant="body" style={styles.notFoundText}>
              We couldn&apos;t find an order with number &quot;{orderId}&quot;.
            </ThemedText>
            <ThemedText variant="body" style={styles.notFoundHelp}>
              Please verify the order number with your customer or order system
            </ThemedText>
          </View>
        )}

        {order && (
          <>
            <TouchableOpacity 
              style={styles.backToSearchLink} 
              onPress={handleNewSearch}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.backToSearchText}>
                ← Back to Search
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.orderCard}>
              {/* Order Header with ID, Status, and Customer Info */}
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderTop}>
                <ThemedText variant="title" style={styles.orderTitle}>
                  Order #{order.id}
                </ThemedText>
                <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                  <ThemedText style={styles.statusText}>
                    {order.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.customerInfoRow}>
                <ThemedText variant="body" style={styles.customerCompactText}>
                  {order.customer_name}
                  {order.customer_phone && ` | ${order.customer_phone}`}
                </ThemedText>
                {order.customer_phone && (
                  <Button
                    title="📞 Call"
                    onPress={() => Linking.openURL(`tel:${order.customer_phone}`)}
                    variant="outline"
                    size="small"
                    style={styles.callButton}
                  />
                )}
              </View>
            </View>

            {/* Items Section */}
            {order.items && order.items.length > 0 && (
              <View style={styles.itemsSection}>
                <ThemedText variant="subtitle" style={styles.sectionTitle}>
                  Items ({order.items_count})
                </ThemedText>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <ThemedText variant="body" style={styles.itemName}>
                        {item.item_name}
                      </ThemedText>
                      <ThemedText variant="caption" style={styles.itemCategory}>
                        {item.item_category}
                      </ThemedText>
                    </View>
                    <View style={styles.itemQuantityBadge}>
                      <ThemedText variant="body" style={styles.itemQuantityText}>
                        {item.qty}×
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Total Section - Simple Order Amount */}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <ThemedText variant="title" style={styles.orderAmountLabel}>Order Amount</ThemedText>
                <ThemedText variant="title" style={styles.orderAmountValue}>
                  ₹{order.grand_total.toFixed(2)}
                </ThemedText>
              </View>
            </View>

            {/* Action Buttons */}
            {(order.status === 'received' || order.status === 'pending') && (
              <View style={styles.actions}>
                <Button
                  title="Cancel Order"
                  onPress={handleCancelOrder}
                  variant="danger"
                  size="large"
                  style={styles.actionButton}
                />
                <Button
                  title="Accept Order"
                  onPress={handleAcceptOrder}
                  variant="primary"
                  size="large"
                  style={styles.actionButton}
                />
              </View>
            )}

            {order.status === 'confirmed' && (
              <View style={styles.actions}>
                <Button
                  title="Cancel Order"
                  onPress={handleCancelOrder}
                  variant="danger"
                  size="large"
                  style={styles.actionButton}
                />
                <Button
                  title="Mark as Delivered"
                  onPress={handleDeliverOrder}
                  variant="primary"
                  size="large"
                  style={styles.actionButton}
                />
              </View>
            )}

            {/* Order Details (Date, Payment Mode, Bill) */}
            <View style={styles.orderDetailsSection}>
              <View style={styles.orderDetailRow}>
                <ThemedText variant="body" style={styles.detailLabel}>Order Date:</ThemedText>
                <ThemedText variant="body" style={styles.detailValue}>
                  {new Date(order.order_date).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </View>
              <View style={styles.orderDetailRow}>
                <ThemedText variant="body" style={styles.detailLabel}>Payment Mode:</ThemedText>
                <ThemedText variant="body" style={styles.detailValue}>
                  {order.paid_online ? `Online (${order.payment_gateway})` : 'Cash on Delivery'}
                </ThemedText>
              </View>
              <View style={styles.orderDetailRow}>
                <ThemedText variant="body" style={styles.detailLabel}>Order Bill:</ThemedText>
                <Button
                  title={isGeneratingBill ? "Generating..." : "View PDF"}
                  onPress={handleGenerateBill}
                  variant="primary"
                  size="small"
                  disabled={isGeneratingBill}
                  style={styles.billButtonInline}
                />
              </View>
            </View>

            </View>
          </>
        )}

        <ConfirmationModal
          visible={showCancelModal}
          title="Cancel Order"
          message={`Are you sure you want to cancel order #${order?.id}? This action cannot be undone.`}
          confirmText="Yes, Cancel Order"
          cancelText="Keep Order"
          confirmVariant="danger"
          onConfirm={confirmCancelOrder}
          onCancel={() => setShowCancelModal(false)}
        />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  scrollContent: {
    padding: theme.layout.containerPadding,
    paddingBottom: theme.spacing.xxxxxxl,
  },
  instructionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.layout.cardPadding,
    marginBottom: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  instructionTitle: {
    fontSize: 18,
    color: theme.colors.dark,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  instructionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchSection: {
    marginBottom: theme.spacing.xl,
  },
  searchCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.l,
    padding: theme.layout.cardPadding,
    ...theme.shadows.medium,
  },
  searchInput: {
    marginBottom: theme.spacing.xxl,
  },
  notFoundCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    ...theme.shadows.small,
  },
  notFoundTitle: {
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
  },
  notFoundText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.m,
  },
  notFoundHelp: {
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600' as const,
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  orderHeader: {
    marginBottom: theme.spacing.l,
    paddingBottom: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  orderTitle: {
    color: theme.colors.dark,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    gap: theme.spacing.m,
  },
  customerCompactText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
  },
  callButton: {
    minWidth: 80,
    paddingHorizontal: theme.spacing.s,
  },
  orderDetailsSection: {
    marginBottom: theme.spacing.l,
    paddingTop: theme.spacing.l,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    color: theme.colors.muted,
    flex: 1,
  },
  detailValue: {
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  itemsSection: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    color: theme.colors.dark,
    marginBottom: theme.spacing.m,
    fontWeight: '600' as const,
  },
  itemsTitle: {
    color: theme.colors.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemCategory: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  itemQuantityBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.s,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemQuantityText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  totalSection: {
    marginBottom: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    paddingHorizontal: theme.spacing.l,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.m,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmountLabel: {
    fontWeight: '700' as const,
    color: theme.colors.dark,
    fontSize: 18,
  },
  orderAmountValue: {
    fontWeight: '700' as const,
    color: theme.colors.primary,
    fontSize: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  actionButton: {
    flex: 1,
  },
  completedActions: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.s,
  },
  completedText: {
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  newSearchButton: {
    marginTop: theme.spacing.m,
  },
  backToSearchLink: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.m,
    alignSelf: 'flex-start',
  },
  backToSearchText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  billButtonInline: {
    minWidth: 100,
  },
});

export default OrderDetailsScreen;