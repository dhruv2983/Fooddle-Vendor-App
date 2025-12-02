import { create } from 'zustand';
// import { Transaction, Bill, PaymentRequest, Ticket, LegacyShopStatus } from '@/types/ledger';
import { Bill, PaymentRequest, Ticket, LegacyShopStatus } from '@/types/ledger';
// Note: This store is kept for backward compatibility with billing/ledger features
// Shop status is now handled in shopStore.ts

interface LedgerState {
  // TODO: Transactions will be implemented in next phase
  // transactions: Transaction[];
  bills: Bill[];
  tickets: Ticket[];
  shopStatus: LegacyShopStatus;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  // TODO: fetchTransactions will be implemented in next phase
  // fetchTransactions: () => Promise<void>;
  fetchBills: () => Promise<void>;
  // Legacy shop status methods - use shopStore for new implementations
  fetchShopStatus: () => Promise<void>;
  toggleShopStatus: (reason?: string) => Promise<void>;
  payBill: (paymentRequest: PaymentRequest) => Promise<void>;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  generateBill: (orderId: string) => Promise<string>; // Returns PDF URL
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useLedgerStore = create<LedgerState>((set, get) => ({
  // TODO: Transactions will be implemented in next phase
  // transactions: [],
  bills: [],
  tickets: [],
  shopStatus: {
    isOnline: true,
    lastToggled: new Date().toISOString(),
  },
  isLoading: false,
  error: null,

  // TODO: fetchTransactions will be implemented in next phase
  // fetchTransactions: async () => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     // TODO: Replace with actual API call when available
  //     await sleep(500);
  //     set({ 
  //       transactions: [], // Empty for now - implement when transaction API is available
  //       isLoading: false 
  //     });
  //   } catch (error) {
  //     set({ 
  //       error: (error as Error).message, 
  //       isLoading: false 
  //     });
  //   }
  // },

  fetchBills: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call when available
      await sleep(500);
      set({ 
        bills: [], // Empty for now - implement when billing API is available
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },

  fetchShopStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      // Legacy method - use shopStore.fetchShopStatus() for new implementations
      await sleep(300);
      const shopStatus: LegacyShopStatus = {
        isOnline: true,
        lastToggled: new Date().toISOString(),
      };
      set({ 
        shopStatus, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },

  toggleShopStatus: async (reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Legacy method - use shopStore.toggleShopStatus() for new implementations
      await sleep(500);
      const currentStatus = get().shopStatus;
      const newStatus: LegacyShopStatus = {
        isOnline: !currentStatus.isOnline,
        lastToggled: new Date().toISOString(),
        reasonForOffline: !currentStatus.isOnline ? undefined : reason,
      };
      set({ 
        shopStatus: newStatus, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },

  payBill: async (paymentRequest: PaymentRequest) => {
    set({ isLoading: true, error: null });
    try {
      await sleep(1000); // Simulate payment processing
      
      // Update bill status to paid
      const bills = get().bills.map(bill => 
        bill.id === paymentRequest.billId 
          ? { ...bill, status: 'paid' as const }
          : bill
      );
      
      // TODO: Transaction record will be added in next phase
      // const newTransaction: Transaction = {
      //   id: `txn_${Date.now()}`,
      //   date: new Date().toISOString(),
      //   type: 'debit',
      //   amount: paymentRequest.amount,
      //   description: `Payment: ${paymentRequest.title}`,
      //   status: 'completed',
      // };
      
      set({ 
        bills,
        // transactions: [newTransaction, ...get().transactions],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },

  createTicket: async (ticketData) => {
    set({ isLoading: true, error: null });
    try {
      await sleep(800);
      
      const newTicket: Ticket = {
        ...ticketData,
        id: `ticket_${Date.now()}`,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({ 
        tickets: [newTicket, ...get().tickets],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
    }
  },

  generateBill: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      await sleep(1500); // Simulate PDF generation
      
      // In real app, this would generate and upload PDF
      const pdfUrl = `https://example.com/bills/order_${orderId}_${Date.now()}.pdf`;
      
      set({ isLoading: false });
      return pdfUrl;
    } catch (error) {
      set({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      throw error;
    }
  },
}));