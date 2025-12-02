export interface OrderItem {
  id: number;
  item_name: string;
  item_price: number;
  item_category: string;
  qty: number;
  total_price: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_date: string;
  base_order_amount: number;
  delivery_charge: number;
  order_convenience_fee: number;
  discount: number;
  gst: number;
  grand_total: number;
  status: 'received' | 'confirmed' | 'delivered' | 'cancelled';
  paid_online: boolean;
  type_delivery: boolean;
  payment_gateway?: string;
  items: OrderItem[];
  items_count: number;
}

export interface OrderStatusUpdate {
  status: 'confirmed' | 'delivered' | 'cancelled';
  reason?: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  period_start: string;
  period_end: string;
}
