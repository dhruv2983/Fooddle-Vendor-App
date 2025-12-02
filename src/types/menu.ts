export interface MenuItem {
  id: number;
  name: string;
  price: string | number; // API returns string, we'll handle conversion
  mrp?: string | number;
  showMRP?: boolean;
  visible: boolean;
  category_id: number;
  category_name?: string;
  discount_amount?: number;
  discount_percentage?: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  item_count: number;
}

export interface CreateMenuItemRequest {
  name: string;
  price: number;
  mrp?: number;
  showMRP?: boolean;
  visible: boolean;
  category_id: number;
}

export interface UpdateMenuItemRequest {
  name?: string;
  price?: number;
  mrp?: number;
  visible?: boolean;
}

export interface MenuStats {
  total_items: number;
  visible_items: number;
  hidden_items: number;
  categories_count: number;
  average_price: number;
}
