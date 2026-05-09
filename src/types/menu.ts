export interface MenuVariant {
  id: number;
  name: string;
  price: string;
  mrp: string;
  showMRP: boolean;
  visible: boolean;
  is_available: boolean;
  is_default: boolean;
  display_order: number;
  image: string;
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  discount_amount: number;
  discount_percentage: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  visible: boolean;
  image: string;
  category_id: number;
  category_name: string;
  variants: MenuVariant[];
}

export interface MenuCategory {
  id: number;
  name: string;
  item_count: number;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  visible?: boolean;
  category_id: number;
  variants: {
    name: string;
    price: number;
    mrp?: number;
    showMRP?: boolean;
    visible?: boolean;
    is_default?: boolean;
  }[];
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  visible?: boolean;
}

export interface UpdateVariantRequest {
  name?: string;
  price?: number;
  mrp?: number;
  showMRP?: boolean;
  is_available?: boolean;
}

export interface ProductRequest {
  id: number;
  request_type: string;
  request_type_display: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  payload: Record<string, any>;
  submitted_at: string;
  reviewed_at: string | null;
  review_comments: string | null;
  submitted_by_name: string;
  reviewed_by_name: string | null;
  target_product_id: number | null;
  target_variant_id: number | null;
  applied_at: string | null;
}
