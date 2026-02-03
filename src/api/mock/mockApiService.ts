/**
 * Mock API Service
 * Complete mock implementation of all API endpoints
 */

import { LoginRequest, User, HealthCheckResponse } from '@/types/auth';
import { Order, OrderStatusUpdate, OrderStats } from '@/types/orders';
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest, MenuCategory, MenuStats } from '@/types/menu';
import { Shop, UpdateShopRequest, ShopStatus, UpdateShopStatusRequest, Analytics } from '@/types/shop';
import { OrderFilters, MenuFilters, AnalyticsParams } from '@/config/api';
import {
  generateMockUser,
  generateMockHealthCheck,
  generateMockShop,
  generateMockShopStatus,
  generateMockAnalytics,
  generateMockOrders,
  generateMockOrderStats,
  generateMockMenuItems,
  generateMockCategories,
  generateMockMenuStats,
} from './mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mock data
class MockDataStore {
  private static instance: MockDataStore;
  
  user: User | null = null;
  shop: Shop = generateMockShop();
  shopStatus: ShopStatus = generateMockShopStatus();
  orders: Order[] = generateMockOrders(50);
  menuItems: MenuItem[] = generateMockMenuItems(50);
  categories: MenuCategory[] = generateMockCategories();
  
  private constructor() {}
  
  static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }
  
  reset() {
    this.user = null;
    this.shop = generateMockShop();
    this.shopStatus = generateMockShopStatus();
    this.orders = generateMockOrders(50);
    this.menuItems = generateMockMenuItems(50);
    this.categories = generateMockCategories();
  }
}

export class MockApiService {
  private store = MockDataStore.getInstance();
  private authenticated = false;
  
  // Authentication & Health
  async login({ username, password }: LoginRequest): Promise<{ user: User; token: string }> {
    await delay(800);
    
    // Simple mock authentication - accept any credentials for demo
    if (username && password) {
      this.authenticated = true;
      const user = generateMockUser();
      this.store.user = user;
      const token = btoa(`${username}:${password}`);
      
      console.log('[MOCK API] Login successful:', username);
      return { user, token };
    }
    
    throw new Error('Invalid credentials');
  }
  
  async healthCheck(): Promise<HealthCheckResponse> {
    await delay(200);
    return generateMockHealthCheck();
  }
  
  // Shop Management
  async getShop(): Promise<Shop> {
    await delay(300);
    console.log('[MOCK API] Fetching shop data');
    return this.store.shop;
  }
  
  async updateShop(data: UpdateShopRequest): Promise<Shop> {
    await delay(500);
    console.log('[MOCK API] Updating shop:', data);
    
    this.store.shop = {
      ...this.store.shop,
      ...data,
    };
    
    return this.store.shop;
  }
  
  async getShopStatus(): Promise<ShopStatus> {
    await delay(200);
    console.log('[MOCK API] Fetching shop status');
    return this.store.shopStatus;
  }
  
  async updateShopStatus(data: UpdateShopStatusRequest): Promise<ShopStatus> {
    await delay(400);
    console.log('[MOCK API] Updating shop status:', data);
    
    this.store.shopStatus = {
      ...this.store.shopStatus,
      is_operating: data.is_operating,
      last_updated: new Date().toISOString(),
    };
    
    return this.store.shopStatus;
  }
  
  async getShopAnalytics(params?: AnalyticsParams): Promise<Analytics> {
    await delay(600);
    console.log('[MOCK API] Fetching shop analytics:', params);
    return generateMockAnalytics();
  }
  
  // Order Management
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    await delay(400);
    console.log('[MOCK API] Fetching orders with filters:', filters);
    
    let filteredOrders = [...this.store.orders];
    
    // Apply filters
    if (filters?.status) {
      filteredOrders = filteredOrders.filter(o => o.status === filters.status);
    }
    
    if (filters?.payment_type) {
      const paidOnline = filters.payment_type === 'online';
      filteredOrders = filteredOrders.filter(o => o.paid_online === paidOnline);
    }
    
    if (filters?.order_type) {
      const isDelivery = filters.order_type === 'delivery';
      filteredOrders = filteredOrders.filter(o => o.type_delivery === isDelivery);
    }
    
    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    return filteredOrders.slice(startIndex, endIndex);
  }
  
  async getOrderById(id: string): Promise<Order> {
    await delay(300);
    console.log('[MOCK API] Fetching order:', id);
    
    const order = this.store.orders.find(o => o.id === parseInt(id));
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }
    
    return order;
  }
  
  async updateOrderStatus(id: string, data: OrderStatusUpdate): Promise<Order> {
    await delay(500);
    console.log('[MOCK API] Updating order status:', id, data);
    
    const orderIndex = this.store.orders.findIndex(o => o.id === parseInt(id));
    if (orderIndex === -1) {
      throw new Error(`Order ${id} not found`);
    }
    
    this.store.orders[orderIndex] = {
      ...this.store.orders[orderIndex],
      status: data.status,
    };
    
    return this.store.orders[orderIndex];
  }
  
  async getOrderStats(params?: AnalyticsParams): Promise<OrderStats> {
    await delay(400);
    console.log('[MOCK API] Fetching order stats:', params);
    return generateMockOrderStats();
  }
  
  // Menu Management
  async getMenu(filters?: MenuFilters): Promise<MenuItem[]> {
    await delay(400);
    console.log('[MOCK API] Fetching menu with filters:', filters);
    
    let filteredItems = [...this.store.menuItems];
    
    if (filters?.category_id) {
      filteredItems = filteredItems.filter(i => i.category_id === filters.category_id);
    }
    
    if (filters?.visible !== undefined) {
      filteredItems = filteredItems.filter(i => i.visible === filters.visible);
    }
    
    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    return filteredItems.slice(startIndex, endIndex);
  }
  
  async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
    await delay(500);
    console.log('[MOCK API] Creating menu item:', data);
    
    const newItem: MenuItem = {
      id: this.store.menuItems.length + 1,
      ...data,
      category_name: this.store.categories.find(c => c.id === data.category_id)?.name || 'Unknown',
      discount_amount: data.showMRP && data.mrp ? data.mrp - data.price : 0,
      discount_percentage: data.showMRP && data.mrp ? parseFloat((((data.mrp - data.price) / data.mrp) * 100).toFixed(2)) : 0,
    };
    
    this.store.menuItems.unshift(newItem);
    return newItem;
  }
  
  async getMenuItem(id: string): Promise<MenuItem> {
    await delay(300);
    console.log('[MOCK API] Fetching menu item:', id);
    
    const item = this.store.menuItems.find(i => i.id === parseInt(id));
    if (!item) {
      throw new Error(`Menu item ${id} not found`);
    }
    
    return item;
  }
  
  async updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<MenuItem> {
    await delay(500);
    console.log('[MOCK API] Updating menu item:', id, data);
    
    const itemIndex = this.store.menuItems.findIndex(i => i.id === parseInt(id));
    if (itemIndex === -1) {
      throw new Error(`Menu item ${id} not found`);
    }
    
    this.store.menuItems[itemIndex] = {
      ...this.store.menuItems[itemIndex],
      ...data,
    };
    
    return this.store.menuItems[itemIndex];
  }
  
  async deleteMenuItem(id: string): Promise<void> {
    await delay(500);
    console.log('[MOCK API] Deleting menu item:', id);
    
    const itemIndex = this.store.menuItems.findIndex(i => i.id === parseInt(id));
    if (itemIndex === -1) {
      throw new Error(`Menu item ${id} not found`);
    }
    
    this.store.menuItems.splice(itemIndex, 1);
  }
  
  async toggleMenuItemVisibility(id: string, visible: boolean): Promise<MenuItem> {
    await delay(400);
    console.log('[MOCK API] Toggling menu item visibility:', id, visible);
    
    const itemIndex = this.store.menuItems.findIndex(i => i.id === parseInt(id));
    if (itemIndex === -1) {
      throw new Error(`Menu item ${id} not found`);
    }
    
    this.store.menuItems[itemIndex].visible = visible;
    return this.store.menuItems[itemIndex];
  }
  
  async getMenuCategories(): Promise<MenuCategory[]> {
    await delay(300);
    console.log('[MOCK API] Fetching menu categories');
    return this.store.categories;
  }
  
  async getMenuStats(): Promise<MenuStats> {
    await delay(400);
    console.log('[MOCK API] Fetching menu stats');
    return generateMockMenuStats(this.store.menuItems);
  }
  
  // Analytics
  async getAnalyticsOverview(params?: AnalyticsParams): Promise<Analytics> {
    await delay(600);
    console.log('[MOCK API] Fetching analytics overview:', params);
    return generateMockAnalytics();
  }
  
  async getOrderAnalytics(params?: AnalyticsParams): Promise<any> {
    await delay(600);
    console.log('[MOCK API] Fetching order analytics:', params);
    return generateMockAnalytics();
  }
  
  async getRevenueAnalytics(params?: AnalyticsParams): Promise<any> {
    await delay(600);
    console.log('[MOCK API] Fetching revenue analytics:', params);
    return generateMockAnalytics();
  }
  
  // Helper methods
  setCredentials(username: string, password: string) {
    this.authenticated = true;
    console.log('[MOCK API] Credentials set for:', username);
  }
  
  clearCredentials() {
    this.authenticated = false;
    console.log('[MOCK API] Credentials cleared');
  }
}

export const mockApiService = new MockApiService();
