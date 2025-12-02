// TODO: Transactions will be implemented in next phase
// export interface Transaction {
//   id: string;
//   date: string;
//   type: 'credit' | 'debit';
//   amount: number;
//   description: string;
//   orderId?: string;
//   status: 'completed' | 'pending' | 'failed';
// }

export interface Bill {
  bill_id: string;
  bill_number: string;
  category: 'rent' | 'commission' | 'subscription' | 'penalty' | 'other';
  title: string;
  amount: string;
  fine_amount: string;
  total_amount: string;
  status: 'issued' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issue_date: string;
  paid_date: string | null;
  shop_id: number;
  shop_name: string;
  days_until_due: number;
  days_overdue: number;
  is_overdue: boolean;
  pdf_download_url: string;
  created_at: string;
}

export interface BillsResponse {
  bills: Bill[];
  summary: any;
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface PaymentRequest {
  billId: string;
  title: string;
  description: string;
  amount: number;
  supportingDocument?: {
    type: 'image' | 'pdf';
    uri: string;
    name: string;
  };
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  supportingDocument?: {
    type: 'image' | 'pdf';
    uri: string;
    name: string;
  };
}

// Shop status moved to shop.ts - keeping for backward compatibility
export interface LegacyShopStatus {
  isOnline: boolean;
  lastToggled: string;
  reasonForOffline?: string;
}