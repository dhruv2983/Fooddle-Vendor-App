import { api } from './api';
import { Bill, BillsResponse } from '@/types/ledger';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

class BillsAPI {
  private basePath = '/api/vendors/v1/bills';

  // Get bills for current vendor
  async getBills(page = 1, per_page = 20): Promise<BillsResponse> {
    const response = await api.get<BillsResponse>(
      `${this.basePath}/?page=${page}&per_page=${per_page}`
    );
    return response.data;
  }

  // Get specific bill
  async getBill(billId: string): Promise<Bill> {
    const response = await api.get<{ bill: Bill }>(`${this.basePath}/${billId}/`);
    return response.data.bill;
  }

  // Download bill PDF
  async downloadBillPDF(billId: string): Promise<string> {
    const response = await api.get<{ pdf_url: string }>(`${this.basePath}/${billId}/download/`);
    return response.data.pdf_url;
  }
}

export const billsAPI = new BillsAPI();