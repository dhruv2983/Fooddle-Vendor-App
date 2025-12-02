import { create } from 'zustand';
import { supportAPI } from '@/api/supportApi';
import { 
  SupportTicket, 
  CreateTicketRequest, 
  TicketEnumsResponse,
  TicketPriority,
  TicketCategory 
} from '@/types/support';

interface SupportState {
  // Data
  tickets: SupportTicket[];
  enums: TicketEnumsResponse | null;
  priorities: Array<{ value: TicketPriority; label: string; color: string }>;
  categories: Array<{ value: TicketCategory; label: string; description: string }>;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isLoadingEnums: boolean;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalTickets: number;
  
  // Actions
  fetchTickets: (page?: number) => Promise<void>;
  createTicket: (ticket: CreateTicketRequest) => Promise<SupportTicket>;
  fetchEnums: () => Promise<void>;
  fetchPriorities: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  getTicketById: (id: string) => Promise<SupportTicket>;
  updateTicket: (id: string, updates: Partial<CreateTicketRequest>) => Promise<SupportTicket>;
  sendMessageToTicket: (ticketId: string, message: string) => Promise<{ success: boolean; ticket_status: string; success_message: string }>;
  
  // Utility
  reset: () => void;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  // Initial state
  tickets: [],
  enums: null,
  priorities: [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'urgent', label: 'Urgent', color: '#DC2626' },
  ],
  categories: [
    { value: 'technical', label: 'Technical', description: 'Technical issues and app problems' },
    { value: 'billing', label: 'Billing', description: 'Account settings, billing questions, or payment issues' },
    { value: 'order', label: 'Order', description: 'Issues with orders, payments, or order processing' },
    { value: 'general', label: 'General', description: 'General questions or other topics' },
  ],
  
  isLoading: false,
  isCreating: false,
  isLoadingEnums: false,
  currentPage: 1,
  totalPages: 1,
  totalTickets: 0,

  // Fetch tickets with pagination
  fetchTickets: async (page = 1) => {
    set({ isLoading: true });
    try {
      const response = await supportAPI.getTickets(page, 20);
      set({
        tickets: response.tickets,
        currentPage: response.pagination.page,
        totalPages: response.pagination.total_pages,
        totalTickets: response.pagination.total,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // Create new ticket
  createTicket: async (ticketData: CreateTicketRequest) => {
    set({ isCreating: true });
    try {
      const newTicket = await supportAPI.createTicket(ticketData);
      
      // Add to the beginning of tickets list
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
        totalTickets: state.totalTickets + 1,
        isCreating: false,
      }));
      
      return newTicket;
    } catch (error) {
      set({ isCreating: false });
      console.error('Failed to create ticket:', error);
      throw error;
    }
  },

  // Fetch all enums at once
  fetchEnums: async () => {
    set({ isLoadingEnums: true });
    try {
      const enums = await supportAPI.getTicketEnums();
      set({
        enums,
        priorities: enums.priorities,
        categories: enums.categories,
        isLoadingEnums: false,
      });
    } catch (error) {
      console.error('Failed to fetch enums:', error);
      set({ isLoadingEnums: false });
      // Keep default values if API fails
    }
  },

  // Fetch priority options only
  fetchPriorities: async () => {
    try {
      const priorities = await supportAPI.getPriorities();
      set({ priorities });
    } catch (error) {
      console.error('Failed to fetch priorities:', error);
      // Keep default priorities if API fails
    }
  },

  // Fetch category options only
  fetchCategories: async () => {
    try {
      const categories = await supportAPI.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Keep default categories if API fails
    }
  },

  // Get single ticket
  getTicketById: async (id: string) => {
    try {
      return await supportAPI.getTicket(id);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      throw error;
    }
  },

  // Update ticket
  updateTicket: async (id: string, updates: Partial<CreateTicketRequest>) => {
    try {
      const updatedTicket = await supportAPI.updateTicket(id, updates);
      
      // Update in local state
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket.ticket_id === id ? updatedTicket : ticket
        ),
      }));
      
      return updatedTicket;
    } catch (error) {
      console.error('Failed to update ticket:', error);
      throw error;
    }
  },

  // Send message to ticket
  sendMessageToTicket: async (ticketId: string, message: string) => {
    try {
      const response = await supportAPI.sendMessage(ticketId, message);
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Reset store
  reset: () => {
    set({
      tickets: [],
      enums: null,
      isLoading: false,
      isCreating: false,
      isLoadingEnums: false,
      currentPage: 1,
      totalPages: 1,
      totalTickets: 0,
    });
  },
}));