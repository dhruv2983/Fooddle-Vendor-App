import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types/orders';
import { theme } from '@/constants/theme';
import { apiService } from '@/api/api';
import { API_CONFIG } from '@/config/api';
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

  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState<boolean>(false);
  const { updateOrderStatus } = useOrderStore();
  const configurations = useAuthStore((state) => state.configurations);
  const token = useAuthStore((state) => state.token);
  const skipOrderConfirmation = configurations?.skip_order_confirmation?.is_enabled ?? false;

  useEffect(() => {
    if (!incomingOrderId?.trim()) return;
    const fetchOrder = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const orderData = await apiService.getOrderById(incomingOrderId.trim());
        if (orderData?.id) {
          setOrder(orderData);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        log.error('Error fetching order', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [incomingOrderId]);

  const handleAcceptOrder = async () => {
    if (!order) return;
    try {
      const updated = await updateOrderStatus(order.id.toString(), { status: 'confirmed' });
      setOrder(updated);
      Alert.alert('Success', `Order #${updated.shop_daily_serial ?? updated.id} has been accepted and confirmed`);
    } catch {
      Alert.alert('Error', 'Failed to accept order. Please try again.');
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!order) return;
    try {
      const updated = await updateOrderStatus(order.id.toString(), { status: 'cancelled', reason: 'Cancelled by vendor' });
      setOrder(updated);
      setShowCancelModal(false);
      Alert.alert('Success', `Order #${updated.shop_daily_serial ?? updated.id} has been cancelled`);
    } catch {
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    }
  };

  const handleDeliverOrder = async () => {
    if (!order) return;
    try {
      const updated = await updateOrderStatus(order.id.toString(), { status: 'delivered' });
      setOrder(updated);
      Alert.alert('Success', `Order #${updated.shop_daily_serial ?? updated.id} has been marked as delivered`);
    } catch {
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    }
  };

  const handleGenerateBill = async () => {
    if (!order || !token) return;

    setIsGeneratingBill(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/vendors/${API_CONFIG.VERSION}/generate-bill/?entity_type=order&entity_id=${order.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const billData = await response.json();

      if (billData.download_url) {
        const supported = await Linking.canOpenURL(billData.download_url);
        if (supported) {
          await Linking.openURL(billData.download_url);
        } else {
          Alert.alert('Error', 'Unable to open the bill PDF.');
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


  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <Header title="Order Details" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {isLoading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Loading order...</ThemedText>
          </View>
        )}

        {!isLoading && notFound && (
          <View style={styles.notFoundCard}>
            <ThemedText variant="title" style={styles.notFoundTitle}>Order Not Found</ThemedText>
            <ThemedText variant="body" style={styles.notFoundText}>
              Could not load this order. Please try again.
            </ThemedText>
          </View>
        )}

        {order && (
          <>
            <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderTop}>
                <ThemedText variant="title" style={styles.orderTitle}>
                  Order #{order.shop_daily_serial ?? order.id}
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
                  ₹{parseFloat(order.amount as any || 0).toFixed(2)}
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
                {skipOrderConfirmation ? (
                  <Button
                    title="Mark as Delivered"
                    onPress={handleDeliverOrder}
                    variant="primary"
                    size="large"
                    style={styles.actionButton}
                  />
                ) : (
                  <Button
                    title="Accept Order"
                    onPress={handleAcceptOrder}
                    variant="primary"
                    size="large"
                    style={styles.actionButton}
                  />
                )}
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
          message={`Are you sure you want to cancel order #${order?.shop_daily_serial ?? order?.id}? This action cannot be undone.`}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxxl,
    gap: theme.spacing.m,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 14,
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
    fontWeight: '700' as const,
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    gap: theme.spacing.m,
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
  billButtonInline: {
    minWidth: 100,
  },
});

export default OrderDetailsScreen;