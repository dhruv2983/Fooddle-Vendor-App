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

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
  user: string;
  shop: string;
}
