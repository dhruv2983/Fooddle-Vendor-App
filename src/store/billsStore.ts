import { create } from 'zustand';
import { billsAPI } from '@/api/billsApi';
import { Bill, BillsResponse } from '@/types/ledger';
import { log } from '@/utils/logger';

interface BillsState {
  // Data
  bills: Bill[];
  summary: any;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalBills: number;
  
  // Actions
  fetchBills: (page?: number) => Promise<void>;
  refreshBills: () => Promise<void>;
  getBillById: (id: string) => Promise<Bill>;
  downloadBillPDF: (billId: string) => Promise<string>;
  
  // Utility
  reset: () => void;
}

export const useBillsStore = create<BillsState>((set, get) => ({
  // Initial state
  bills: [],
  summary: {},
  
  isLoading: false,
  isRefreshing: false,
  currentPage: 1,
  totalPages: 1,
  totalBills: 0,

  // Fetch bills with pagination
  fetchBills: async (page = 1) => {
    set({ isLoading: true });
    try {
      const response = await billsAPI.getBills(page, 20);
      set({
        bills: response.bills,
        summary: response.summary,
        currentPage: response.pagination.page,
        totalPages: response.pagination.total_pages,
        totalBills: response.pagination.total,
        isLoading: false,
      });
    } catch (error) {
      log.error('Failed to fetch bills', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Refresh bills (pull-to-refresh)
  refreshBills: async () => {
    set({ isRefreshing: true });
    try {
      await get().fetchBills(1); // Reset to first page
    } catch (error) {
      log.error('Failed to refresh bills', error);
      throw error;
    } finally {
      set({ isRefreshing: false });
    }
  },

  // Get single bill
  getBillById: async (id: string) => {
    try {
      return await billsAPI.getBill(id);
    } catch (error) {
      log.error('Failed to fetch bill', error);
      throw error;
    }
  },

  // Download bill PDF
  downloadBillPDF: async (billId: string) => {
    try {
      return await billsAPI.downloadBillPDF(billId);
    } catch (error) {
      log.error('Failed to download bill PDF', error);
      throw error;
    }
  },

  // Reset store
  reset: () => {
    set({
      bills: [],
      summary: {},
      isLoading: false,
      isRefreshing: false,
      currentPage: 1,
      totalPages: 1,
      totalBills: 0,
    });
  },
}));