/**
 * Mock Data Generators
 * Generate realistic mock data for all API responses
 */

import { User, HealthCheckResponse } from '@/types/auth';
import { Shop, ShopStatus, Analytics } from '@/types/shop';
import { Order, OrderItem, OrderStats } from '@/types/orders';
import { MenuItem, MenuCategory, MenuStats } from '@/types/menu';
import { Bill, BillsResponse } from '@/types/ledger';
import { SupportTicket, SupportMessage, TicketEnumsResponse, TicketPriority, TicketCategory } from '@/types/support';

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString();
};

// Mock User Data
export const generateMockUser = (): User => ({
  id: '1',
  name: 'Demo Vendor',
  email: 'vendor@demo.com',
  shop: {
    id: 1,
    name: 'Demo Restaurant',
    region_name: 'Downtown',
  },
});

// Mock Health Check
export const generateMockHealthCheck = (): HealthCheckResponse => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  version: 'v1',
  user: 'Demo Vendor',
  shop: 'Demo Restaurant',
});

// Mock Shop Data
export const generateMockShop = (): Shop => ({
  id: 1,
  name: 'Demo Restaurant',
  region_name: 'Downtown',
  s_address: '123 Main Street, City, State 12345',
  phone: '+1234567890',
  min_order_amount: 100,
  delivery_charge: 30,
  discount: 0,
  is_operating: true,
  pickup: true,
  delivery: true,
  closing_time: '23:00',
  cuisine_type: 'Multi-Cuisine',
  delivery_time: '30-45 mins',
  vpa: 'demo@upi',
  subscribe_by_delivery: true,
  subscribe_by_comission: false,
  comission_in_percentage: 0,
});

// Mock Shop Status
export const generateMockShopStatus = (isOperating?: boolean): ShopStatus => ({
  is_operating: isOperating ?? true,
  last_updated: new Date().toISOString(),
  closing_time: '23:00',
});

// Mock Analytics
export const generateMockAnalytics = (): Analytics => ({
  total_orders: randomInt(100, 500),
  pending_orders: randomInt(5, 20),
  completed_orders: randomInt(80, 450),
  cancelled_orders: randomInt(5, 30),
  total_revenue: randomFloat(50000, 200000),
  today_revenue: randomFloat(2000, 8000),
  this_month_revenue: randomFloat(30000, 100000),
  average_order_value: randomFloat(200, 500),
  completion_rate: randomFloat(85, 98),
  period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  period_end: new Date().toISOString(),
});

// Mock Order Items
const generateMockOrderItems = (count: number = randomInt(1, 5)): OrderItem[] => {
  const items: OrderItem[] = [];
  const itemNames = ['Paneer Tikka', 'Chicken Biryani', 'Veg Pizza', 'Burger Combo', 'Pasta', 'Noodles', 'Fried Rice'];
  const categories = ['Starters', 'Main Course', 'Fast Food', 'Chinese', 'Italian'];
  
  for (let i = 0; i < count; i++) {
    const price = parseFloat(randomFloat(100, 500));
    const qty = randomInt(1, 3);
    items.push({
      id: i + 1,
      item_name: itemNames[randomInt(0, itemNames.length - 1)],
      item_price: price,
      item_category: categories[randomInt(0, categories.length - 1)],
      qty,
      total_price: price * qty,
    });
  }
  
  return items;
};

// Mock Orders
export const generateMockOrders = (count: number = 20): Order[] => {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['received', 'confirmed', 'delivered', 'cancelled'];
  const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown'];
  const addresses = [
    '123 Oak Street, Apt 4B',
    '456 Maple Avenue, Suite 200',
    '789 Pine Road, Floor 3',
    '321 Elm Drive, Unit 15',
    '654 Cedar Lane, Building A',
  ];
  
  for (let i = 1; i <= count; i++) {
    const items = generateMockOrderItems();
    const baseAmount = items.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryCharge = randomInt(0, 50);
    const convenienceFee = parseFloat((baseAmount * 0.02).toFixed(2));
    const discount = randomInt(0, 50);
    const gst = parseFloat((baseAmount * 0.05).toFixed(2));
    const grandTotal = baseAmount + deliveryCharge + convenienceFee - discount + gst;
    
    orders.push({
      id: i,
      customer_name: names[randomInt(0, names.length - 1)],
      customer_phone: `+1${randomInt(1000000000, 9999999999)}`,
      customer_address: addresses[randomInt(0, addresses.length - 1)],
      order_date: randomDate(30),
      base_order_amount: baseAmount,
      delivery_charge: deliveryCharge,
      order_convenience_fee: convenienceFee,
      discount,
      gst,
      grand_total: grandTotal,
      status: statuses[randomInt(0, statuses.length - 1)],
      paid_online: Math.random() > 0.3,
      type_delivery: Math.random() > 0.2,
      payment_gateway: Math.random() > 0.5 ? 'Razorpay' : 'PayU',
      items,
      items_count: items.length,
    });
  }
  
  return orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
};

// Mock Order Stats
export const generateMockOrderStats = (): OrderStats => ({
  total_orders: randomInt(100, 500),
  pending_orders: randomInt(5, 20),
  completed_orders: randomInt(80, 450),
  cancelled_orders: randomInt(5, 30),
  period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  period_end: new Date().toISOString().split('T')[0],
});

// Mock Menu Categories
export const generateMockCategories = (): MenuCategory[] => [
  { id: 1, name: 'Starters', item_count: 12 },
  { id: 2, name: 'Main Course', item_count: 25 },
  { id: 3, name: 'Breads', item_count: 8 },
  { id: 4, name: 'Beverages', item_count: 15 },
  { id: 5, name: 'Desserts', item_count: 10 },
  { id: 6, name: 'Chinese', item_count: 18 },
  { id: 7, name: 'South Indian', item_count: 14 },
];

// Mock Menu Items
export const generateMockMenuItems = (count: number = 50): MenuItem[] => {
  const items: MenuItem[] = [];
  const categories = generateMockCategories();
  const starterNames = ['Paneer Tikka', 'Chicken Tikka', 'Veg Spring Roll', 'Chicken Wings', 'French Fries'];
  const mainCourseNames = ['Butter Chicken', 'Paneer Butter Masala', 'Dal Makhani', 'Chicken Biryani', 'Veg Biryani'];
  const chineseNames = ['Fried Rice', 'Noodles', 'Manchurian', 'Spring Roll', 'Chilli Chicken'];
  const beverageNames = ['Coke', 'Pepsi', 'Fresh Lime', 'Mango Juice', 'Water Bottle'];
  const dessertNames = ['Gulab Jamun', 'Ice Cream', 'Kulfi', 'Rasgulla', 'Brownie'];
  
  const allNames = [...starterNames, ...mainCourseNames, ...chineseNames, ...beverageNames, ...dessertNames];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[randomInt(0, categories.length - 1)];
    const price = parseFloat(randomFloat(50, 500));
    const mrp = price + parseFloat(randomFloat(10, 100));
    const showMRP = Math.random() > 0.5;
    
    items.push({
      id: i,
      name: allNames[randomInt(0, allNames.length - 1)] + (i > allNames.length ? ` ${i}` : ''),
      price,
      mrp,
      showMRP,
      visible: Math.random() > 0.2, // 80% items visible
      category_id: category.id,
      category_name: category.name,
      discount_amount: showMRP ? mrp - price : 0,
      discount_percentage: showMRP ? parseFloat((((mrp - price) / mrp) * 100).toFixed(2)) : 0,
    });
  }
  
  return items;
};

// Mock Menu Stats
export const generateMockMenuStats = (items: MenuItem[]): MenuStats => ({
  total_items: items.length,
  visible_items: items.filter(i => i.visible).length,
  hidden_items: items.filter(i => !i.visible).length,
  categories_count: generateMockCategories().length,
  average_price: parseFloat((items.reduce((sum, item) => sum + parseFloat(item.price.toString()), 0) / items.length).toFixed(2)),
});

// Mock Bills - Only 2 bills: Electricity and Rent with fine
export const generateMockBills = (count: number = 20): Bill[] => {
  const bills: Bill[] = [];
  
  // Bill 1: Electricity
  const electricityIssueDate = new Date();
  electricityIssueDate.setDate(electricityIssueDate.getDate() - 10);
  const electricityDueDate = new Date(electricityIssueDate);
  electricityDueDate.setDate(electricityDueDate.getDate() + 15);
  
  bills.push({
    bill_id: '1',
    bill_number: `BILL-${new Date().getFullYear()}-0001`,
    category: 'other',
    title: 'Electricity Bill',
    amount: '3500.00',
    fine_amount: '0.00',
    total_amount: '3500.00',
    status: 'issued',
    due_date: electricityDueDate.toISOString(),
    issue_date: electricityIssueDate.toISOString(),
    paid_date: null,
    shop_id: 1,
    shop_name: 'Demo Restaurant',
    days_until_due: Math.ceil((electricityDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    days_overdue: 0,
    is_overdue: false,
    pdf_download_url: 'https://mock-api.example.com/bills/1/download.pdf',
    created_at: electricityIssueDate.toISOString(),
  });
  
  // Bill 2: Rent with Fine (Overdue)
  const rentIssueDate = new Date();
  rentIssueDate.setDate(rentIssueDate.getDate() - 25);
  const rentDueDate = new Date(rentIssueDate);
  rentDueDate.setDate(rentDueDate.getDate() + 15);
  const rentIsOverdue = new Date() > rentDueDate;
  
  bills.push({
    bill_id: '2',
    bill_number: `BILL-${new Date().getFullYear()}-0002`,
    category: 'rent',
    title: 'Monthly Rent',
    amount: '15000.00',
    fine_amount: '750.00',
    total_amount: '15750.00',
    status: 'overdue',
    due_date: rentDueDate.toISOString(),
    issue_date: rentIssueDate.toISOString(),
    paid_date: null,
    shop_id: 1,
    shop_name: 'Demo Restaurant',
    days_until_due: Math.ceil((rentDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    days_overdue: rentIsOverdue ? Math.ceil((Date.now() - rentDueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
    is_overdue: rentIsOverdue,
    pdf_download_url: 'https://mock-api.example.com/bills/2/download.pdf',
    created_at: rentIssueDate.toISOString(),
  });
  
  return bills;
};

// Mock Support Tickets
export const generateMockTickets = (count: number = 15): SupportTicket[] => {
  const tickets: SupportTicket[] = [];
  const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
  const categories: TicketCategory[] = ['technical', 'billing', 'order', 'general'];
  const statuses: SupportTicket['status'][] = ['open', 'in-progress', 'resolved', 'closed'];
  const subjects = [
    'Payment not received',
    'Menu item not showing',
    'Order notification issue',
    'Unable to update shop status',
    'Delivery charge calculation wrong',
    'Customer complaint about quality',
    'App crashing on order accept',
    'Bill discrepancy',
  ];
  
  for (let i = 1; i <= count; i++) {
    const createdAt = randomDate(30);
    const messages: SupportMessage[] = [
      {
        message_id: `${i}-1`,
        message: 'I am facing an issue with ' + subjects[randomInt(0, subjects.length - 1)].toLowerCase(),
        sender_name: 'Demo Vendor',
        is_admin_response: false,
        created_at: createdAt,
        updated_at: createdAt,
        read_by_user: true,
        read_by_admin: Math.random() > 0.5,
        attachments: [],
      },
    ];
    
    // Add support response for some tickets
    if (Math.random() > 0.4) {
      const responseDate = new Date(new Date(createdAt).getTime() + 2 * 60 * 60 * 1000).toISOString();
      messages.push({
        message_id: `${i}-2`,
        message: 'Thank you for contacting us. We are looking into your issue and will get back to you shortly.',
        sender_name: 'Support Team',
        is_admin_response: true,
        created_at: responseDate,
        updated_at: responseDate,
        read_by_user: Math.random() > 0.3,
        read_by_admin: true,
        attachments: [],
      });
    }
    
    const status = statuses[randomInt(0, statuses.length - 1)];
    const updatedAt = randomDate(5);
    
    tickets.push({
      ticket_id: i.toString(),
      title: subjects[randomInt(0, subjects.length - 1)],
      description: 'Detailed description of the issue...',
      priority: priorities[randomInt(0, priorities.length - 1)],
      category: categories[randomInt(0, categories.length - 1)],
      status: status,
      user_type: 'shop',
      submitter_name: 'Demo Vendor',
      submitter_email: 'vendor@demo.com',
      shop_id: 1,
      created_at: createdAt,
      updated_at: updatedAt,
      resolved_at: status === 'resolved' || status === 'closed' ? updatedAt : null,
      closed_at: status === 'closed' ? updatedAt : null,
      message_count: messages.length,
      unread_count: messages.filter(m => !m.read_by_user && m.is_admin_response).length,
      latest_message: messages[messages.length - 1]?.message || null,
      response_time_hours: messages.length > 1 ? 2 : null,
      resolution_time_hours: status === 'resolved' || status === 'closed' ? randomInt(2, 48) : null,
      tags: [],
      messages,
    });
  }
  
  return tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Mock Ticket Enums
export const generateMockTicketEnums = (): TicketEnumsResponse => ({
  priorities: [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' },
  ],
  categories: [
    { value: 'technical', label: 'Technical Issue', description: 'App bugs, errors, or technical problems' },
    { value: 'billing', label: 'Billing & Payments', description: 'Payment issues, bill discrepancies' },
    { value: 'order', label: 'Order Issues', description: 'Order processing, status updates' },
    { value: 'general', label: 'General Inquiry', description: 'Other questions and feedback' },
  ],
  statuses: [
    { value: 'open', label: 'Open', color: '#3b82f6' },
    { value: 'in-progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'resolved', label: 'Resolved', color: '#10b981' },
    { value: 'closed', label: 'Closed', color: '#6b7280' },
  ],
});
