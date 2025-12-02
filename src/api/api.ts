import { API_CONFIG, ApiResponse, API_ERROR_CODES, OrderFilters, MenuFilters, AnalyticsParams } from '@/config/api';
import { LoginRequest, User, AuthCredentials, HealthCheckResponse } from '@/types/auth';
import { Order, OrderStatusUpdate, OrderStats } from '@/types/orders';
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest, MenuCategory, MenuStats } from '@/types/menu';
import { Shop, UpdateShopRequest, ShopStatus, UpdateShopStatusRequest, Analytics } from '@/types/shop';

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public requestId?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string = API_CONFIG.BASE_URL;
  private credentials: string | null = null;

  // Set authentication credentials
  setCredentials(username: string, password: string) {
    this.credentials = btoa(`${username}:${password}`);
  }

  // Clear authentication credentials
  clearCredentials() {
    this.credentials = null;
  }

  // Make authenticated request
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.credentials) {
      headers['Authorization'] = `Basic ${this.credentials}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Log API request
    console.log(`API Request: ${options.method || 'GET'} ${url}`, {
      headers: Object.fromEntries(
        Object.entries(headers).map(([k, v]) => 
          [k, k.toLowerCase() === 'authorization' ? '[HIDDEN]' : v]
        )
      ),
      body: options.body || null
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      

      // Extract useful headers
      const requestId = response.headers.get('X-Request-ID');
      const processingTime = response.headers.get('X-Processing-Time');

      let data: ApiResponse<T>;
      let rawResponseText: string = '';
      
      try {
        rawResponseText = await response.text();
        data = JSON.parse(rawResponseText);
        
        // Log API response
        console.log(`API Response: ${response.status} ${response.statusText}`, {
          url: url,
          headers: Object.fromEntries(response.headers.entries()),
          success: data.success,
          error: data.error?.message || null,
          data: data.data ? Object.keys(data.data) : null
        });
        
      } catch (parseError) {
        console.log(`API Response: ${response.status} Parse Error`, {
          url: url,
          error: 'Invalid JSON response',
          rawResponse: rawResponseText.substring(0, 200)
        });
        
        throw new ApiError(
          API_ERROR_CODES.INTERNAL_SERVER_ERROR,
          'Invalid JSON response from server',
          response.status,
          requestId || undefined
        );
      }

      if (!response.ok) {
        throw new ApiError(
          data.error?.code || API_ERROR_CODES.INTERNAL_SERVER_ERROR,
          data.error?.message || 'An error occurred',
          response.status,
          requestId || undefined,
          data.error?.details
        );
      }

      if (!data.success) {
        throw new ApiError(
          data.error?.code || API_ERROR_CODES.INTERNAL_SERVER_ERROR,
          data.error?.message || 'Request failed',
          response.status,
          requestId || undefined,
          data.error?.details
        );
      }

      return data.data!;
    } catch (error) {
      // Log API error
      console.log(`API Error: ${options.method || 'GET'} ${url}`, {
        error: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(
          API_ERROR_CODES.TIMEOUT_ERROR,
          'Request timed out'
        );
      }
      
      // Network errors (connection refused, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          API_ERROR_CODES.NETWORK_ERROR,
          `Cannot connect to server at ${this.baseURL}. Make sure the backend is running and accessible.`
        );
      }
      
      throw new ApiError(
        API_ERROR_CODES.NETWORK_ERROR,
        error instanceof Error ? error.message : 'Network error occurred'
      );
    }
  }

  // Authentication & Health
  async login({ username, password }: LoginRequest): Promise<{ user: User; token: string }> {
    this.setCredentials(username, password);
    
    try {
      const healthData = await this.makeRequest<HealthCheckResponse>(API_CONFIG.ENDPOINTS.HEALTH);
      
      // Create user object from health check response
      const user: User = {
        id: '1', // You might want to get this from a separate endpoint
        name: healthData.user,
        email: username, // Assuming username is email
        shop: {
          id: 1, // You might want to extract this from shop data
          name: healthData.shop,
          region_name: '', // Would come from shop details
        }
      };

      return {
        user,
        token: this.credentials!, // Using Basic Auth credentials as token
      };
    } catch (error) {
      this.clearCredentials();
      throw error;
    }
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>(API_CONFIG.ENDPOINTS.HEALTH);
  }

  // Shop Management
  async getShop(): Promise<Shop> {
    return this.makeRequest<Shop>(API_CONFIG.ENDPOINTS.SHOP);
  }

  async updateShop(data: UpdateShopRequest): Promise<Shop> {
    return this.makeRequest<Shop>(API_CONFIG.ENDPOINTS.SHOP, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getShopStatus(): Promise<ShopStatus> {
    return this.makeRequest<ShopStatus>(API_CONFIG.ENDPOINTS.SHOP_STATUS);
  }

  async updateShopStatus(data: UpdateShopStatusRequest): Promise<ShopStatus> {
    return this.makeRequest<ShopStatus>(API_CONFIG.ENDPOINTS.SHOP_STATUS, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getShopAnalytics(params?: AnalyticsParams): Promise<Analytics> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.makeRequest<Analytics>(`${API_CONFIG.ENDPOINTS.SHOP_ANALYTICS}${query}`);
  }

  // Order Management
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    const query = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    const response = await this.makeRequest<Order[]>(`${API_CONFIG.ENDPOINTS.ORDERS}${query}`);
    return Array.isArray(response) ? response : [];
  }

  async getOrderById(id: string): Promise<Order> {
    return this.makeRequest<Order>(API_CONFIG.ENDPOINTS.ORDER_DETAILS(id));
  }

  async updateOrderStatus(id: string, data: OrderStatusUpdate): Promise<Order> {
    return this.makeRequest<Order>(API_CONFIG.ENDPOINTS.ORDER_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getOrderStats(params?: AnalyticsParams): Promise<OrderStats> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.makeRequest<OrderStats>(`${API_CONFIG.ENDPOINTS.ORDER_STATS}${query}`);
  }

  // Menu Management
  async getMenu(filters?: MenuFilters): Promise<MenuItem[]> {
    const query = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    const response = await this.makeRequest<MenuItem[]>(`${API_CONFIG.ENDPOINTS.MENU}${query}`);
    return Array.isArray(response) ? response : [];
  }

  async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
    return this.makeRequest<MenuItem>(API_CONFIG.ENDPOINTS.MENU_CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMenuItem(id: string): Promise<MenuItem> {
    return this.makeRequest<MenuItem>(API_CONFIG.ENDPOINTS.MENU_ITEM(id));
  }

  async updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<MenuItem> {
    return this.makeRequest<MenuItem>(API_CONFIG.ENDPOINTS.MENU_ITEM(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string): Promise<void> {
    await this.makeRequest(API_CONFIG.ENDPOINTS.MENU_ITEM(id), {
      method: 'DELETE',
    });
  }

  async toggleMenuItemVisibility(id: string, visible: boolean): Promise<MenuItem> {
    return this.makeRequest<MenuItem>(API_CONFIG.ENDPOINTS.MENU_VISIBILITY(id), {
      method: 'PUT',
      body: JSON.stringify({ visible }),
    });
  }

  async getMenuCategories(): Promise<MenuCategory[]> {
    return this.makeRequest<MenuCategory[]>(API_CONFIG.ENDPOINTS.MENU_CATEGORIES);
  }

  async getMenuStats(): Promise<MenuStats> {
    return this.makeRequest<MenuStats>(API_CONFIG.ENDPOINTS.MENU_STATS);
  }

  // Analytics
  async getAnalyticsOverview(params?: AnalyticsParams): Promise<Analytics> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.makeRequest<Analytics>(`${API_CONFIG.ENDPOINTS.ANALYTICS_OVERVIEW}${query}`);
  }

  async getOrderAnalytics(params?: AnalyticsParams): Promise<any> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.ANALYTICS_ORDERS}${query}`);
  }

  async getRevenueAnalytics(params?: AnalyticsParams): Promise<any> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.makeRequest(`${API_CONFIG.ENDPOINTS.ANALYTICS_REVENUE}${query}`);
  }

  // Generic HTTP methods for external usage
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const data = await this.makeRequest<T>(endpoint);
    return { data };
  }

  async post<T>(endpoint: string, body?: any): Promise<{ data: T }> {
    const data = await this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }

  async put<T>(endpoint: string, body?: any): Promise<{ data: T }> {
    const data = await this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    const data = await this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
    return { data };
  }
}

export const apiService = new ApiService();
export const api = apiService; // Alias for backward compatibility
export { ApiError };
