/**
 * API Configuration
 * Production-ready configuration for Vendor API v1
 */

import { ENV } from './environment';

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  VERSION: ENV.API_VERSION,
  TIMEOUT: ENV.API_TIMEOUT,
  ENDPOINTS: {
    // Base paths
    VENDORS: `/api/vendors/${ENV.API_VERSION}`,
    
    // Authentication & Health
    HEALTH: `/api/vendors/${ENV.API_VERSION}/health/`,
    
    // Shop Management
    SHOP: `/api/vendors/${ENV.API_VERSION}/shop/`,
    SHOP_STATUS: `/api/vendors/${ENV.API_VERSION}/shop/status/`,
    SHOP_ANALYTICS: `/api/vendors/${ENV.API_VERSION}/shop/analytics/`,
    
    // Order Management
    ORDERS: `/api/vendors/${ENV.API_VERSION}/orders/`,
    ORDER_DETAILS: (id: string) => `/api/vendors/${ENV.API_VERSION}/orders/${id}/`,
    ORDER_STATUS: (id: string) => `/api/vendors/${ENV.API_VERSION}/orders/${id}/status/`,
    ORDER_STATS: `/api/vendors/${ENV.API_VERSION}/orders/stats/`,
    
    // Menu Management
    MENU: `/api/vendors/${ENV.API_VERSION}/menu/`,
    MENU_CREATE: `/api/vendors/${ENV.API_VERSION}/menu/create/`,
    MENU_ITEM: (id: string) => `/api/vendors/${ENV.API_VERSION}/menu/${id}/`,
    MENU_VISIBILITY: (id: string) => `/api/vendors/${ENV.API_VERSION}/menu/${id}/visibility/`,
    MENU_VARIANT: (variantId: string) => `/api/vendors/${ENV.API_VERSION}/menu/${variantId}/`,
    MENU_CATEGORIES: `/api/vendors/${ENV.API_VERSION}/menu/categories/`,
    // Product Requests
    PRODUCT_REQUESTS: `/api/vendors/${ENV.API_VERSION}/product-requests/`,

    // Configurations
    CONFIGURATIONS: `/api/vendors/${ENV.API_VERSION}/configurations/`,
    CONFIGURATION_UPDATE: (key: string) => `/api/vendors/${ENV.API_VERSION}/configurations/${key}/`,

    // Analytics
    ANALYTICS_OVERVIEW: `/api/vendors/${ENV.API_VERSION}/analytics/overview/`,
    ANALYTICS_ORDERS: `/api/vendors/${ENV.API_VERSION}/analytics/orders/`,
    ANALYTICS_REVENUE: `/api/vendors/${ENV.API_VERSION}/analytics/revenue/`,
  }
} as const;

// Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    request_id?: string;
  };
  meta: {
    timestamp: string;
    version: string;
    pagination?: {
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

// API Error codes
export const API_ERROR_CODES = {
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  SHOP_NOT_FOUND: 'SHOP_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

// Query parameter types
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface OrderFilters extends PaginationParams {
  status?: 'pending' | 'received' | 'confirmed' | 'delivered' | 'cancelled';
  shop_daily_serial?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  payment_type?: 'online' | 'cash';
  order_type?: 'delivery' | 'pickup';
}

export interface MenuFilters extends PaginationParams {
  category_id?: number;
  visible?: boolean;
}

export interface AnalyticsParams {
  period?: 'week' | 'month' | 'year';
}