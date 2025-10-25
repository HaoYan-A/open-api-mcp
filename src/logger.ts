/**
 * Logging utility for request/response tracking
 */

import type { LogLevel, RequestLogEntry } from './types.js';

export class Logger {
  private logLevel: LogLevel;
  private logRequests: boolean;
  private logResponses: boolean;
  private logs: RequestLogEntry[] = [];

  constructor(logLevel: LogLevel = 'info', logRequests: boolean = true, logResponses: boolean = true) {
    this.logLevel = logLevel;
    this.logRequests = logRequests;
    this.logResponses = logResponses;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    let output = `[${timestamp}] ${levelStr} ${message}`;

    if (data !== undefined) {
      if (typeof data === 'object') {
        output += '\n' + JSON.stringify(data, null, 2);
      } else {
        output += ' ' + String(data);
      }
    }

    return output;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, data));
    }
  }

  logRequest(entry: RequestLogEntry): void {
    if (!this.logRequests) return;

    this.logs.push(entry);

    if (this.shouldLog('info')) {
      const { method, url, auth, status, duration } = entry;
      let message = `${method} ${url}`;

      if (status !== undefined) {
        message += ` - ${status}`;
      }

      if (duration !== undefined) {
        message += ` (${duration}ms)`;
      }

      message += ` [${auth}]`;

      this.info(message);

      if (this.shouldLog('debug')) {
        if (entry.request && this.logRequests) {
          this.debug('Request', entry.request);
        }
        if (entry.response && this.logResponses) {
          this.debug('Response', entry.response);
        }
        if (entry.error) {
          this.error('Error', entry.error);
        }
      }
    }
  }

  getLogs(): RequestLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getRecentLogs(count: number = 10): RequestLogEntry[] {
    return this.logs.slice(-count);
  }
}

// Global logger instance
export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 'info',
  process.env.LOG_REQUESTS !== 'false',
  process.env.LOG_RESPONSES !== 'false'
);
