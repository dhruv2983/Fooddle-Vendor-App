import { api } from './api';
import { 
  SupportTicket, 
  CreateTicketRequest, 
  TicketEnumsResponse,
  TicketPriority,
  TicketCategory,
  TicketDetailResponse
} from '@/types/support';
import { ENV } from '@/config/environment';
import { mockSupportAPI } from './mock';

export interface PaginatedTicketsResponse {
  tickets: SupportTicket[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

class SupportAPI {
  private basePath = '/api/vendors/v1/support';

  // Get enum values for dropdowns
  async getTicketEnums(): Promise<TicketEnumsResponse> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.getTicketEnums();
    const response = await api.get<TicketEnumsResponse>(`${this.basePath}/enums/`);
    return response.data;
  }

  // Get priority options
  async getPriorities(): Promise<Array<{ value: TicketPriority; label: string; color: string }>> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.getPriorities();
    const response = await api.get<{ priorities: Array<{ value: TicketPriority; label: string; color: string }> }>(`${this.basePath}/priorities/`);
    return response.data.priorities;
  }

  // Get category options
  async getCategories(): Promise<Array<{ value: TicketCategory; label: string; description: string }>> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.getCategories();
    const response = await api.get<{ categories: Array<{ value: TicketCategory; label: string; description: string }> }>(`${this.basePath}/categories/`);
    return response.data.categories;
  }

  // Create ticket (submitter info extracted from auth)
  async createTicket(ticketData: CreateTicketRequest): Promise<SupportTicket> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.createTicket(ticketData);
    const response = await api.post<SupportTicket>(`${this.basePath}/tickets/`, ticketData);
    return response.data;
  }

  // Get tickets for current user/shop
  async getTickets(page = 1, per_page = 20): Promise<PaginatedTicketsResponse> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.getTickets(page, per_page);
    const response = await api.get<PaginatedTicketsResponse>(
      `${this.basePath}/tickets/?page=${page}&per_page=${per_page}`
    );
    return response.data;
  }

  // Get specific ticket with messages
  async getTicket(ticketId: string): Promise<SupportTicket> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.getTicket(ticketId);
    const response = await api.get<TicketDetailResponse>(`${this.basePath}/tickets/${ticketId}/`);
    return response.data.ticket;
  }

  // Update ticket
  async updateTicket(ticketId: string, updateData: Partial<CreateTicketRequest>): Promise<SupportTicket> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.updateTicket(ticketId, updateData);
    const response = await api.put<SupportTicket>(`${this.basePath}/tickets/${ticketId}/`, updateData);
    return response.data;
  }

  // Send message to ticket
  async sendMessage(ticketId: string, message: string): Promise<{ success: boolean; ticket_status: string; success_message: string }> {
    if (ENV.USE_MOCK_API) return mockSupportAPI.sendMessage(ticketId, message);
    const response = await api.post<{ 
      message: { message: string };
      ticket_status: string;
      success_message: string;
    }>(`${this.basePath}/tickets/${ticketId}/messages/`, { message });
    return {
      success: true,
      ticket_status: response.data.ticket_status,
      success_message: response.data.success_message
    };
  }
}

export const supportAPI = new SupportAPI();