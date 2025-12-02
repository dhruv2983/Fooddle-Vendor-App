import { create } from 'zustand';
import { apiService, ApiError } from '@/api/api';
import { Order, OrderStatusUpdate, OrderStats } from '@/types/orders';
import { OrderFilters, AnalyticsParams } from '@/config/api';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  orderStats: OrderStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    hasNext: boolean;
    total: number;
  };
  
  // Actions
  fetchOrders: (filters?: OrderFilters, append?: boolean) => Promise<{ hasNext: boolean }>;
  fetchOrderById: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, data: OrderStatusUpdate) => Promise<void>;
  fetchOrderStats: (params?: AnalyticsParams) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  clearError: () => void;
  refreshOrders: () => Promise<void>;
  loadMoreOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  orderStats: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    hasNext: true,
    total: 0,
  },
  
  fetchOrders: async (filters, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const page = append ? get().pagination.page + 1 : 1;
      const paginatedFilters = { ...filters, page };
      const response = await apiService.getOrders(paginatedFilters);
      const orders = Array.isArray(response) ? response : [];
      
      // Handle pagination metadata if available
      const hasNext = orders.length === (paginatedFilters.per_page || 20);
      
      set(state => ({
        orders: append ? [...state.orders, ...orders] : orders,
        isLoading: false,
        pagination: {
          page,
          hasNext,
          total: append ? state.pagination.total + orders.length : orders.length,
        }
      }));
      
      return { hasNext };
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch orders', isLoading: false });
      }
      return { hasNext: false };
    }
  },
  
  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const order = await apiService.getOrderById(id);
      set({ currentOrder: order, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch order details', isLoading: false });
      }
    }
  },
  
  updateOrderStatus: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await apiService.updateOrderStatus(id, data);
      
      // Update the order in the orders array
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === parseInt(id) ? updatedOrder : order
        ),
        currentOrder: state.currentOrder?.id === parseInt(id) ? updatedOrder : state.currentOrder,
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to update order status', isLoading: false });
      }
    }
  },
  
  fetchOrderStats: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const orderStats = await apiService.getOrderStats(params);
      set({ orderStats, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch order statistics', isLoading: false });
      }
    }
  },
  
  getOrderById: (id) => {
    const orders = get().orders;
    return Array.isArray(orders) ? orders.find(order => order.id === parseInt(id)) : undefined;
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  refreshOrders: async () => {
    await get().fetchOrders();
  },
  
  loadMoreOrders: async () => {
    if (get().pagination.hasNext && !get().isLoading) {
      await get().fetchOrders(undefined, true);
    }
  },
}));
