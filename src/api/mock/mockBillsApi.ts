/**
 * Mock Bills API
 */

import { Bill, BillsResponse } from '@/types/ledger';
import { generateMockBills } from './mockData';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

class MockBillsAPI {
  private bills: Bill[] = generateMockBills(30);

  async getBills(page = 1, per_page = 20): Promise<BillsResponse> {
    await delay(400);
    console.log('[MOCK API] Fetching bills:', { page, per_page });
    
    const startIndex = (page - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedBills = this.bills.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.bills.length / per_page);
    
    return {
      bills: paginatedBills,
      summary: {
        total_bills: this.bills.length,
        total_amount: this.bills.reduce((sum, b) => sum + parseFloat(b.total_amount), 0).toFixed(2),
        paid_amount: this.bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + parseFloat(b.total_amount), 0).toFixed(2),
        pending_amount: this.bills.filter(b => b.status === 'issued' || b.status === 'overdue').reduce((sum, b) => sum + parseFloat(b.total_amount), 0).toFixed(2),
      },
      pagination: {
        total: this.bills.length,
        page,
        per_page,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async getBill(billId: string): Promise<Bill> {
    await delay(300);
    console.log('[MOCK API] Fetching bill:', billId);
    
    const bill = this.bills.find(b => b.bill_id === billId);
    if (!bill) {
      throw new Error(`Bill ${billId} not found`);
    }
    
    return bill;
  }

  async downloadBillPDF(billId: string): Promise<string> {
    await delay(500);
    console.log('[MOCK API] Downloading bill PDF:', billId);
    
    const bill = this.bills.find(b => b.bill_id === billId);
    if (!bill) {
      throw new Error(`Bill ${billId} not found`);
    }
    
    // Return the mock PDF URL from the bill
    return bill.pdf_download_url;
  }
}

export const mockBillsAPI = new MockBillsAPI();
