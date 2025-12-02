export interface Shop {
  id: number;
  name: string;
  region_name: string;
  s_address: string;
  phone: string;
  min_order_amount: number;
  delivery_charge: number;
  discount: number;
  is_operating: boolean;
  pickup: boolean;
  delivery: boolean;
  closing_time: string;
  cuisine_type: string;
  delivery_time: string;
  vpa?: string;
  subscribe_by_delivery: boolean;
  subscribe_by_comission: boolean;
  comission_in_percentage: number;
}

export interface UpdateShopRequest {
  name?: string;
  phone?: string;
  min_order_amount?: number;
  delivery_charge?: number;
  pickup?: boolean;
  delivery?: boolean;
  closing_time?: string;
  cuisine_type?: string;
  delivery_time?: string;
  vpa?: string;
}

export interface ShopStatus {
  is_operating: boolean;
  last_updated: string;
  closing_time: string;
}

export interface UpdateShopStatusRequest {
  is_operating: boolean;
  reason?: string;
}

export interface ShopAnalytics {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: string;
  today_revenue: string;
  this_month_revenue: string;
  average_order_value: string;
  completion_rate: string;
  period_start: string;
  period_end: string;
}

export interface Analytics {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: string;
  today_revenue: string;
  this_month_revenue: string;
  average_order_value: string;
  completion_rate: string;
  period_start: string;
  period_end: string;
}