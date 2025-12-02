// Support ticket types with auth integration
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export type TicketCategory = 'technical' | 'billing' | 'order' | 'general';

export type SubmitterType = 'shop' | 'user';

export interface TicketSubmitter {
  id: string;
  type: SubmitterType;
  name: string;
  email: string;
}

export interface SupportMessage {
  message_id: string;
  message: string;
  sender_name: string;
  is_admin_response: boolean;
  created_at: string;
  updated_at: string;
  read_by_user: boolean;
  read_by_admin: boolean;
  attachments: any[];
}

export interface SupportTicket {
  ticket_id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  user_type: string;
  submitter_name: string;
  submitter_email: string;
  shop_id: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  message_count: number;
  unread_count?: number;
  latest_message?: string | null;
  response_time_hours: number | null;
  resolution_time_hours: number | null;
  tags: string[];
  messages?: SupportMessage[];
  metadata?: any;
}

export interface TicketDetailResponse {
  ticket: SupportTicket;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  tags?: string[];
  // submitter_id and submitter_type will be extracted from auth
}

// API Response types for enums
export interface TicketEnumsResponse {
  priorities: Array<{
    value: TicketPriority;
    label: string;
    color: string;
  }>;
  categories: Array<{
    value: TicketCategory;
    label: string;
    description: string;
  }>;
  statuses: Array<{
    value: TicketStatus;
    label: string;
    color: string;
  }>;
}