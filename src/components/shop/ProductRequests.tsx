import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { theme } from '@/constants/theme';
import { apiService } from '@/api/api';
import { ProductRequest } from '@/types/menu';
import Ionicons from '@expo/vector-icons/Ionicons';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FFF7E0', text: '#B45309' },
  approved: { bg: '#ECFDF5', text: '#065F46' },
  rejected: { bg: '#FEF2F2', text: '#991B1B' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatPayloadKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatPayloadValue(val: any): string {
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (val === null || val === undefined) return '—';
  return String(val);
}

interface RequestCardProps {
  request: ProductRequest;
}

const RequestCard = ({ request }: RequestCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_COLORS[request.status] ?? STATUS_COLORS.pending;
  const payloadEntries = Object.entries(request.payload);

  return (
    <View style={styles.card}>
      {/* Header — always visible */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded(prev => !prev)}
        activeOpacity={0.75}
      >
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.requestType}>{request.request_type_display}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                {request.status_display}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.submittedAt}>{formatDate(request.submitted_at)}</ThemedText>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      {/* Expanded body */}
      {expanded && (
        <View style={styles.cardBody}>
          {/* Submitted by */}
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>Submitted by</ThemedText>
            <ThemedText style={styles.metaValue}>{request.submitted_by_name}</ThemedText>
          </View>

          {/* Target info */}
          {request.target_product_id != null && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Product ID</ThemedText>
              <ThemedText style={styles.metaValue}>#{request.target_product_id}</ThemedText>
            </View>
          )}
          {request.target_variant_id != null && (
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Variant ID</ThemedText>
              <ThemedText style={styles.metaValue}>#{request.target_variant_id}</ThemedText>
            </View>
          )}

          {/* Requested changes */}
          <ThemedText style={styles.sectionLabel}>Requested Changes</ThemedText>
          <View style={styles.payloadBox}>
            {payloadEntries.map(([key, val]) => (
              <View key={key} style={styles.payloadRow}>
                <ThemedText style={styles.payloadKey}>{formatPayloadKey(key)}</ThemedText>
                <ThemedText style={styles.payloadVal}>{formatPayloadValue(val)}</ThemedText>
              </View>
            ))}
          </View>

          {/* Review info */}
          {request.reviewed_at && (
            <>
              <View style={styles.metaRow}>
                <ThemedText style={styles.metaLabel}>Reviewed by</ThemedText>
                <ThemedText style={styles.metaValue}>{request.reviewed_by_name ?? '—'}</ThemedText>
              </View>
              <View style={styles.metaRow}>
                <ThemedText style={styles.metaLabel}>Reviewed at</ThemedText>
                <ThemedText style={styles.metaValue}>{formatDate(request.reviewed_at)}</ThemedText>
              </View>
            </>
          )}
          {request.review_comments && (
            <View style={styles.commentsBox}>
              <ThemedText style={styles.metaLabel}>Review Comments</ThemedText>
              <ThemedText style={styles.commentsText}>{request.review_comments}</ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const ProductRequests = () => {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getProductRequests();
      setRequests(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load requests');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading requests...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity onPress={() => load()} style={styles.retryBtn}>
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.emptyText}>No product requests found</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => load(true)}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {requests.map(req => (
        <RequestCard key={req.id} request={req} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.m,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.s,
  },
  loadingText: { color: theme.colors.muted, marginTop: 8 },
  errorText: { color: '#991B1B', textAlign: 'center' },
  emptyText: { color: theme.colors.muted, fontSize: 16, fontStyle: 'italic' },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.s,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  // Card
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 14,
  },
  headerLeft: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  requestType: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  submittedAt: { fontSize: 12, color: theme.colors.muted },

  // Body
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#E0EAF5',
    padding: theme.spacing.m,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: { fontSize: 12, color: theme.colors.muted, flex: 1 },
  metaValue: { fontSize: 13, fontWeight: '500', color: theme.colors.text, flex: 2, textAlign: 'right' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  payloadBox: {
    backgroundColor: '#F4F8FF',
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.s,
    gap: 6,
  },
  payloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payloadKey: { fontSize: 13, color: theme.colors.text, flex: 1 },
  payloadVal: { fontSize: 13, fontWeight: '600', color: theme.colors.primary, flex: 1, textAlign: 'right' },
  commentsBox: { gap: 4 },
  commentsText: { fontSize: 13, color: theme.colors.text, fontStyle: 'italic' },
});

export default ProductRequests;
