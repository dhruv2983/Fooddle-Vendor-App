/**
 * Mock Support API
 */

import {
  SupportTicket,
  CreateTicketRequest,
  TicketEnumsResponse,
  TicketPriority,
  TicketCategory,
} from '@/types/support';
import { generateMockTickets, generateMockTicketEnums } from './mockData';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

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

class MockSupportAPI {
  private tickets: SupportTicket[] = generateMockTickets(20);
  private enums: TicketEnumsResponse = generateMockTicketEnums();

  async getTicketEnums(): Promise<TicketEnumsResponse> {
    await delay(200);
    console.log('[MOCK API] Fetching ticket enums');
    return this.enums;
  }

  async getPriorities(): Promise<Array<{ value: TicketPriority; label: string; color: string }>> {
    await delay(200);
    console.log('[MOCK API] Fetching priorities');
    return this.enums.priorities;
  }

  async getCategories(): Promise<Array<{ value: TicketCategory; label: string; description: string }>> {
    await delay(200);
    console.log('[MOCK API] Fetching categories');
    return this.enums.categories;
  }

  async createTicket(ticketData: CreateTicketRequest): Promise<SupportTicket> {
    await delay(600);
    console.log('[MOCK API] Creating ticket:', ticketData);
    
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      ticket_id: (this.tickets.length + 1).toString(),
      title: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority,
      category: ticketData.category,
      status: 'open',
      user_type: 'shop',
      submitter_name: 'Demo Vendor',
      submitter_email: 'vendor@demo.com',
      shop_id: 1,
      created_at: now,
      updated_at: now,
      resolved_at: null,
      closed_at: null,
      message_count: 1,
      unread_count: 0,
      latest_message: ticketData.description,
      response_time_hours: null,
      resolution_time_hours: null,
      tags: ticketData.tags || [],
      messages: [
        {
          message_id: `${this.tickets.length + 1}-1`,
          message: ticketData.description,
          sender_name: 'Demo Vendor',
          is_admin_response: false,
          created_at: now,
          updated_at: now,
          read_by_user: true,
          read_by_admin: false,
          attachments: [],
        },
      ],
    };
    
    this.tickets.unshift(newTicket);
    return newTicket;
  }

  async getTickets(page = 1, per_page = 20): Promise<PaginatedTicketsResponse> {
    await delay(400);
    console.log('[MOCK API] Fetching tickets:', { page, per_page });
    
    const startIndex = (page - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedTickets = this.tickets.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.tickets.length / per_page);
    
    return {
      tickets: paginatedTickets,
      pagination: {
        total: this.tickets.length,
        page,
        per_page,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async getTicket(ticketId: string): Promise<SupportTicket> {
    await delay(300);
    console.log('[MOCK API] Fetching ticket:', ticketId);
    
    const ticket = this.tickets.find(t => t.ticket_id === ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    
    return ticket;
  }

  async updateTicket(ticketId: string, updateData: Partial<CreateTicketRequest>): Promise<SupportTicket> {
    await delay(500);
    console.log('[MOCK API] Updating ticket:', ticketId, updateData);
    
    const ticketIndex = this.tickets.findIndex(t => t.ticket_id === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    
    this.tickets[ticketIndex] = {
      ...this.tickets[ticketIndex],
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    
    return this.tickets[ticketIndex];
  }

  async sendMessage(ticketId: string, message: string): Promise<{ success: boolean; ticket_status: string; success_message: string }> {
    await delay(500);
    console.log('[MOCK API] Sending message to ticket:', ticketId, message);
    
    const ticketIndex = this.tickets.findIndex(t => t.ticket_id === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    
    const ticket = this.tickets[ticketIndex];
    const now = new Date().toISOString();
    
    const newMessage = {
      message_id: `${ticketId}-${(ticket.messages?.length || 0) + 1}`,
      message,
      sender_name: 'Demo Vendor',
      is_admin_response: false,
      created_at: now,
      updated_at: now,
      read_by_user: true,
      read_by_admin: false,
      attachments: [],
    };
    
    if (ticket.messages) {
      ticket.messages.push(newMessage);
    } else {
      ticket.messages = [newMessage];
    }
    
    ticket.message_count = (ticket.messages?.length || 0);
    ticket.updated_at = now;
    ticket.latest_message = message;
    
    return {
      success: true,
      ticket_status: ticket.status,
      success_message: 'Message sent successfully',
    };
  }
}

export const mockSupportAPI = new MockSupportAPI();
