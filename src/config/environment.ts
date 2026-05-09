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
}

// Get environment from environment variable
const getEnvironment = (): Environment => {
  const env = process.env.EXPO_PUBLIC_ENV as Environment;
  return env || 'development';
};

// Environment-specific configurations
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://fooddle.in',
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
    ENVIRONMENT: 'development',
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
  },
  staging: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api-staging.yourdomain.com',
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '20000'),
    ENVIRONMENT: 'staging',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
  },
  production: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://fooddle.in',
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '15000'),
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    LOG_LEVEL: 'error',
  },
};

// Export current environment configuration
export const ENV = configs[getEnvironment()];

// Utility functions
export const isDevelopment = () => ENV.ENVIRONMENT === 'development';
export const isProduction = () => ENV.ENVIRONMENT === 'production';
export const isStaging = () => ENV.ENVIRONMENT === 'staging';

// Validation
if (!ENV.API_BASE_URL) {
  throw new Error('API_BASE_URL is required but not configured');
}
