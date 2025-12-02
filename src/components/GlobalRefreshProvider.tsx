import React, { createContext, useContext, useCallback } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useMenuStore } from '@/store/menuStore';
import { useShopStore } from '@/store/shopStore';

interface GlobalRefreshContextType {
  refreshAll: () => Promise<void>;
}

const GlobalRefreshContext = createContext<GlobalRefreshContextType | null>(null);

export const GlobalRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchOrders, fetchOrderStats } = useOrderStore();
  const { refreshAll: refreshMenu } = useMenuStore();
  const { fetchShopStatus, fetchAnalytics } = useShopStore();

  const refreshAll = useCallback(async () => {
    // Refresh all data across the app
    await Promise.all([
      fetchOrders(),
      fetchOrderStats(),
      refreshMenu(),
      fetchShopStatus(),
      fetchAnalytics(),
    ]);
  }, [fetchOrders, fetchOrderStats, refreshMenu, fetchShopStatus, fetchAnalytics]);

  return (
    <GlobalRefreshContext.Provider value={{ refreshAll }}>
      {children}
    </GlobalRefreshContext.Provider>
  );
};

export const useGlobalRefresh = () => {
  const context = useContext(GlobalRefreshContext);
  if (!context) {
    throw new Error('useGlobalRefresh must be used within a GlobalRefreshProvider');
  }
  return context;
};