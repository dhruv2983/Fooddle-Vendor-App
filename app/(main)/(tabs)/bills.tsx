import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { useBillsStore } from '@/store/billsStore';
import { Bill } from '@/types/ledger';
import { theme } from '@/constants/theme';
import { log } from '@/utils/logger';

const BillsScreen = () => {
  const { 
    bills, 
    isLoading, 
    isRefreshing,
    fetchBills, 
    refreshBills,
    totalBills 
  } = useBillsStore();

  const loadBills = useCallback(async () => {
    try {
      await fetchBills();
    } catch (error) {
      log.error('Failed to load bills', error);
    }
  }, []); // fetchBills is stable

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshBills();
    } catch (error) {
      log.error('Failed to refresh bills', error);
    }
  }, []); // refreshBills is stable

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return theme.colors.success;
      case 'overdue': return theme.colors.danger;
      case 'issued': return theme.colors.warning;
      case 'cancelled': return theme.colors.muted;
      default: return theme.colors.muted;
    }
  };

  const getOverdueMessage = (bill: Bill) => {
    if (bill.is_overdue) {
      return `Overdue by ${bill.days_overdue} days`;
    }
    return `Due in ${bill.days_until_due} days`;
  };

  // Memoize heavy computations
  const totalDues = useMemo(() => {
    return bills
      .filter(bill => bill.status !== 'paid')
      .reduce((total, bill) => total + parseFloat(bill.total_amount), 0);
  }, [bills]);

  const BillCard = ({ bill }: { bill: Bill }) => (
    <TouchableOpacity style={styles.billCard} activeOpacity={0.6}>
      <View style={styles.billCardContent}>
        <View style={styles.billMainInfo}>
          <View style={styles.billTitleRow}>
            <ThemedText variant="subtitle" style={styles.billTitle}>
              {bill.title}
            </ThemedText>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getBillStatusColor(bill.status) }
            ]} />
          </View>
          
          <ThemedText variant="caption" style={styles.billNumber}>
            {bill.bill_number}
          </ThemedText>
          
          <View style={styles.billMetaRow}>
            <View style={styles.dueDateContainer}>
              <ThemedText variant="caption" style={[
                styles.dueDateLabel,
                bill.is_overdue && styles.overdueText
              ]}>
                {bill.is_overdue ? 'OVERDUE' : 'DUE'}
              </ThemedText>
              <ThemedText variant="caption" style={[
                styles.dueDateValue,
                bill.is_overdue && styles.overdueText
              ]}>
                {bill.is_overdue ? `${bill.days_overdue}d ago` : `${bill.days_until_due}d`}
              </ThemedText>
            </View>
            
            <View style={styles.categoryContainer}>
              <ThemedText style={styles.categoryLabel}>
                {bill.category}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.billAmountSection}>
          <ThemedText variant="body" style={styles.amountLabel}>
            Total Amount
          </ThemedText>
          <ThemedText variant="title" style={styles.amountValue}>
            ₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}
          </ThemedText>
          {parseFloat(bill.fine_amount) > 0 && (
            <ThemedText variant="caption" style={styles.fineAmount}>
              +₹{parseFloat(bill.fine_amount).toLocaleString('en-IN')} fine
            </ThemedText>
          )}
          
          {bill.status !== 'paid' && (
            <TouchableOpacity 
              style={styles.payButton}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.payButtonText}>
                Pay Now
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <Header title="Bills & Dues" subtitle="Manage your outstanding payments" />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Outstanding Amount Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <ThemedText variant="caption" style={styles.summaryTitle}>
              Outstanding Amount
            </ThemedText>
            {totalDues > 0 && (
              <View style={styles.urgencyIndicator}>
                <View style={styles.urgencyDot} />
                <ThemedText style={styles.urgencyLabel}>
                  Action Required
                </ThemedText>
              </View>
            )}
          </View>
          
          <ThemedText variant="header" style={styles.totalAmountValue}>
            ₹{totalDues.toLocaleString('en-IN')}
          </ThemedText>
          
          <View style={styles.summaryMetrics}>
            <View style={styles.metric}>
              <ThemedText variant="caption" style={styles.metricLabel}>
                Pending Bills
              </ThemedText>
              <ThemedText variant="subtitle" style={styles.metricValue}>
                {bills.filter(b => b.status !== 'paid').length}
              </ThemedText>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <ThemedText variant="caption" style={styles.metricLabel}>
                Total Bills
              </ThemedText>
              <ThemedText variant="subtitle" style={styles.metricValue}>
                {totalBills}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Bills List */}
        <View style={styles.billsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="title" style={styles.sectionTitle}>
              Recent Bills
            </ThemedText>
            {bills.length > 0 && (
              <ThemedText variant="caption" style={styles.sectionSubtitle}>
                {bills.length} items
              </ThemedText>
            )}
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <ThemedText variant="body" style={styles.loadingText}>
                Loading bills...
              </ThemedText>
            </View>
          ) : bills.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText variant="subtitle" style={styles.emptyTitle}>
                No Bills Found
              </ThemedText>
              <ThemedText variant="body" style={styles.emptyText}>
                Your bills and dues will appear here
              </ThemedText>
            </View>
          ) : (
            bills.map((bill) => (
              <BillCard key={bill.bill_id} bill={bill} />
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // Modern Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  urgencyLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F59E0B',
  },
  totalAmountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  summaryMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  // Bills Section
  billsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Modern Bill Card
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  billCardContent: {
    padding: 20,
  },
  billMainInfo: {
    marginBottom: 16,
  },
  billTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  billNumber: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontFamily: 'Urbanist-Regular',
  },
  billMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueDateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dueDateValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  overdueText: {
    color: '#DC2626',
  },
  categoryContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
  billAmountSection: {
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  fineAmount: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  payButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BillsScreen;