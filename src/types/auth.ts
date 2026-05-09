export interface User {
  id: string;
  name: string;
  email: string;
  shop?: {
    id: number;
    name: string;
    region_name: string;
  };
}

export interface LoginRequest {
  username: string; // Changed from email to match Basic Auth
  password: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface ShopConfiguration {
  label: string;
  type: string;
  is_enabled: boolean;
}

export interface VendorConfiguration {
  key: string;
  label: string;
  description?: string;
  type: string;
  value: {
    type: string;
    is_enabled: boolean;
  };
  is_enabled: boolean;
  config_id?: number;
}

export interface ShopConfigurations {
  skip_order_confirmation?: ShopConfiguration;
  [key: string]: ShopConfiguration | undefined;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
  user: string;
  shop: string;
  configurations?: ShopConfigurations;
}
