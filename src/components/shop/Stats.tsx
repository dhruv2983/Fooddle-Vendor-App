import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useShopStore } from '@/store/shopStore';
import { theme } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';

const Stats = () => {
  const { analytics, isLoading: analyticsLoading, fetchAnalytics } = useShopStore();

  const loadAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const { isRefreshing, onRefresh } = useRefresh(loadAnalytics);
  const isLoading = analyticsLoading;

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  console.log('Analytics Data:', analytics);

  // Use analytics data if available, otherwise fallback to basic calculations
  const lifetimeOrders = analytics?.total_orders || 0;
  const lifetimeRevenue = analytics?.total_revenue ? parseFloat(analytics.total_revenue) : 0;
  const pendingOrders = analytics?.pending_orders || 0;
  const completedOrders = analytics?.completed_orders || 0;
  const cancelledOrders = analytics?.cancelled_orders || 0;
  const averageOrderValue = analytics?.average_order_value ? parseFloat(analytics.average_order_value) : (lifetimeOrders > 0 ? lifetimeRevenue / lifetimeOrders : 0);
  const todayRevenue = analytics?.today_revenue ? parseFloat(analytics.today_revenue) : 0;
  const thisMonthRevenue = analytics?.this_month_revenue ? parseFloat(analytics.this_month_revenue) : 0;
  const completionRate = analytics?.completion_rate ? parseFloat(analytics.completion_rate) : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText variant="subtitle">Loading analytics...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Hero Revenue Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTextContainer}>
            <ThemedText style={styles.heroLabel}>Total Revenue</ThemedText>
            <ThemedText style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              ₹{lifetimeRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ThemedText>
          </View>
          <View style={styles.heroIcon}>
            <ThemedText style={styles.heroIconText}>💰</ThemedText>
          </View>
        </View>
        
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <ThemedText style={styles.heroMetricLabel}>This Month</ThemedText>
            <ThemedText style={styles.heroMetricValue}>
              ₹{thisMonthRevenue.toLocaleString('en-IN')}
            </ThemedText>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetric}>
            <ThemedText style={styles.heroMetricLabel}>Avg. Order</ThemedText>
            <ThemedText style={styles.heroMetricValue}>
              ₹{averageOrderValue.toLocaleString('en-IN')}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.metricsSection}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Key Metrics</ThemedText>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, styles.ordersIcon]}>
              <ThemedText style={styles.metricIconText}>📦</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{lifetimeOrders}</ThemedText>
            <ThemedText style={styles.metricLabel}>Total Orders</ThemedText>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, styles.completionIcon]}>
              <ThemedText style={styles.metricIconText}>✅</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{completionRate.toFixed(1)}%</ThemedText>
            <ThemedText style={styles.metricLabel}>Completion Rate</ThemedText>
          </View>
        </View>
      </View>

      {/* Order Status Overview */}
      <View style={styles.statusSection}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Order Status</ThemedText>
          <ThemedText style={styles.totalCount}>{lifetimeOrders} total</ThemedText>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, styles.pendingDot]} />
              <ThemedText style={styles.statusLabel}>Pending</ThemedText>
            </View>
            <ThemedText style={styles.statusCount}>{pendingOrders}</ThemedText>
          </View>
          
          <View style={styles.statusItem}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, styles.completedDot]} />
              <ThemedText style={styles.statusLabel}>Completed</ThemedText>
            </View>
            <ThemedText style={styles.statusCount}>{completedOrders}</ThemedText>
          </View>
          
          <View style={styles.statusItem}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, styles.cancelledDot]} />
              <ThemedText style={styles.statusLabel}>Cancelled</ThemedText>
            </View>
            <ThemedText style={styles.statusCount}>{cancelledOrders}</ThemedText>
          </View>
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  // Hero Revenue Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flex: 1,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 16,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: 32,
    minHeight: 32,
  },
  heroTextContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroIconText: {
    fontSize: 24,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  heroMetric: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  heroDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  // Metrics Section
  metricsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ordersIcon: {
    backgroundColor: '#DBEAFE',
  },
  completionIcon: {
    backgroundColor: '#DCFCE7',
  },
  metricIconText: {
    fontSize: 20,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  // Order Status Section
  statusSection: {
    marginBottom: 24,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  pendingDot: {
    backgroundColor: '#F59E0B',
  },
  completedDot: {
    backgroundColor: '#10B981',
  },
  cancelledDot: {
    backgroundColor: '#EF4444',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  statusCount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  
  // Performance Summary
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
});

export default Stats;
