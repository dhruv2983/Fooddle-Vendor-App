import { create } from 'zustand';
import { apiService, ApiError } from '@/api/api';
import { Shop, UpdateShopRequest, ShopStatus, UpdateShopStatusRequest, Analytics } from '@/types/shop';
import { AnalyticsParams } from '@/config/api';

interface ShopState {
  shop: Shop | null;
  shopStatus: ShopStatus | null;
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchShop: () => Promise<void>;
  updateShop: (data: UpdateShopRequest) => Promise<void>;
  fetchShopStatus: () => Promise<void>;
  updateShopStatus: (data: UpdateShopStatusRequest) => Promise<void>;
  fetchAnalytics: (params?: AnalyticsParams) => Promise<void>;
  toggleShopStatus: (reason?: string) => Promise<void>;
  clearError: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
  shop: null,
  shopStatus: null,
  analytics: null,
  isLoading: false,
  error: null,

  fetchShop: async () => {
    set({ isLoading: true, error: null });
    try {
      const shop = await apiService.getShop();
      set({ shop, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch shop details', isLoading: false });
      }
    }
  },

  updateShop: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const shop = await apiService.updateShop(data);
      set({ shop, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to update shop details', isLoading: false });
      }
    }
  },

  fetchShopStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const shopStatus = await apiService.getShopStatus();
      set({ shopStatus, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch shop status', isLoading: false });
      }
    }
  },

  updateShopStatus: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const shopStatus = await apiService.updateShopStatus(data);
      set({ shopStatus, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to update shop status', isLoading: false });
      }
    }
  },

  fetchAnalytics: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await apiService.getAnalyticsOverview(params || { period: 'month' });
      set({ analytics, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch analytics', isLoading: false });
      }
    }
  },

  toggleShopStatus: async (reason) => {
    const currentStatus = get().shopStatus;
    if (!currentStatus) {
      await get().fetchShopStatus();
      return;
    }

    try {
      await get().updateShopStatus({
        is_operating: !currentStatus.is_operating,
        reason,
      });
    } catch (error) {
      // Error handling is done in updateShopStatus
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));