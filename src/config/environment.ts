/**
 * Environment Configuration
 * Manages environment-specific settings for the application
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  API_BASE_URL: string;
  API_VERSION: string;
  API_TIMEOUT: number;
  ENVIRONMENT: Environment;
  DEBUG_MODE: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  USE_MOCK_API: boolean;
}

// Get environment from environment variable
const getEnvironment = (): Environment => {
  const env = process.env.EXPO_PUBLIC_ENV as Environment;
  return env || 'development';
};

// Environment-specific configurations
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
    ENVIRONMENT: 'development',
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
    USE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
  },
  staging: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api-staging.yourdomain.com',
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '20000'),
    ENVIRONMENT: 'staging',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
    USE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
  },
  production: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.yourdomain.com',
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '15000'),
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    LOG_LEVEL: 'error',
    USE_MOCK_API: process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
  },
};

// Export current environment configuration
export const ENV = configs[getEnvironment()];

// Utility functions
export const isDevelopment = () => ENV.ENVIRONMENT === 'development';
export const isProduction = () => ENV.ENVIRONMENT === 'production';
export const isStaging = () => ENV.ENVIRONMENT === 'staging';

// Validation
if (!ENV.USE_MOCK_API && !ENV.API_BASE_URL) {
  throw new Error('API_BASE_URL is required but not configured');
}

// Log mock API status
if (ENV.USE_MOCK_API) {
  console.log('🎭 [MOCK MODE] Using mock API - Perfect for presentations and demos!');
  console.log('💡 To disable: Set EXPO_PUBLIC_USE_MOCK_API=false in .env');
}