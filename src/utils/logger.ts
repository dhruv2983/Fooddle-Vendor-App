/**
 * Configurable Logger System
 * Controls logging based on environment and log level configuration
 */

import { ENV } from '@/config/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  'debug': LogLevel.DEBUG,
  'info': LogLevel.INFO,
  'warn': LogLevel.WARN,
  'error': LogLevel.ERROR,
  'none': LogLevel.NONE,
};

class Logger {
  private currentLevel: LogLevel;
  private isEnabled: boolean;

  constructor() {
    this.currentLevel = LOG_LEVEL_MAP[ENV.LOG_LEVEL] || LogLevel.ERROR;
    this.isEnabled = ENV.DEBUG_MODE;
  }

  /**
   * Debug level - Detailed information for debugging
   * Only visible in development
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Info level - General informational messages
   * Visible in development and staging
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Warning level - Warning messages
   * Visible in all environments
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Error level - Error messages
   * Always visible
   */
  error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      if (error) {
        console.error(`[ERROR] ${message}`, error, ...args);
      } else {
        console.error(`[ERROR] ${message}`, ...args);
      }
    }
  }

  /**
   * API request logging - Only in debug mode
   */
  apiRequest(method: string, url: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[API →] ${method} ${url}`, data ? { body: data } : '');
    }
  }

  /**
   * API response logging - Only in debug mode
   */
  apiResponse(status: number, url: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[API ←] ${status} ${url}`, data ? { data } : '');
    }
  }

  /**
   * API error logging - Always visible
   */
  apiError(method: string, url: string, error: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[API ✗] ${method} ${url}`, error);
    }
  }

  /**
   * Performance logging - Only in debug mode
   */
  performance(label: string, duration: number): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
  }

  /**
   * Store action logging - Only in debug mode
   */
  storeAction(storeName: string, action: string, payload?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[STORE] ${storeName}.${action}`, payload || '');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.isEnabled && level >= this.currentLevel;
  }

  /**
   * Dynamically change log level (useful for debugging)
   */
  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  apiRequest: logger.apiRequest.bind(logger),
  apiResponse: logger.apiResponse.bind(logger),
  apiError: logger.apiError.bind(logger),
  performance: logger.performance.bind(logger),
  storeAction: logger.storeAction.bind(logger),
};
