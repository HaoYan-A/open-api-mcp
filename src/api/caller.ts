/**
 * API caller - executes API requests with authentication
 */

import axios, { AxiosRequestConfig } from 'axios';
import type { ApiCallRequest, ApiCallResponse, Config } from '../types.js';
import { logger } from '../logger.js';
import { AuthManager } from '../auth/auth-manager.js';

export class ApiCaller {
  private baseUrl: string;
  private authManager: AuthManager;

  constructor(baseUrl: string, config: Config) {
    this.baseUrl = baseUrl;
    this.authManager = new AuthManager(config);
  }

  /**
   * Call an API endpoint
   */
  async call(request: ApiCallRequest): Promise<ApiCallResponse> {
    const startTime = Date.now();

    // Build full URL
    let url = request.path;
    if (!url.startsWith('http')) {
      url = this.baseUrl + (url.startsWith('/') ? url : '/' + url);
    }

    // Get auth headers
    const authHeaders = request.authOverride
      ? this.getOverrideAuthHeaders(request.authOverride)
      : await this.authManager.getAuthHeaders();

    // Merge headers
    const headers = {
      ...authHeaders,
      ...request.headers,
    };

    // Build axios config
    const axiosConfig: AxiosRequestConfig = {
      method: request.method.toLowerCase() as any,
      url,
      headers,
      params: request.params,
      data: request.body,
      validateStatus: () => true, // Don't throw on any status
    };

    // Log request
    const authMode = request.authOverride?.type || this.authManager.getAuthMode();
    logger.logRequest({
      timestamp: new Date().toISOString(),
      method: request.method,
      url,
      auth: authMode,
      request: {
        params: request.params,
        body: request.body,
        headers: this.sanitizeHeaders(headers),
      },
    });

    try {
      // Make request
      const response = await axios(axiosConfig);
      const duration = Date.now() - startTime;

      // Prepare response
      const apiResponse: ApiCallResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
        duration,
      };

      // Log response
      logger.logRequest({
        timestamp: new Date().toISOString(),
        method: request.method,
        url,
        auth: authMode,
        status: response.status,
        duration,
        response: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        },
      });

      return apiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;

        logger.logRequest({
          timestamp: new Date().toISOString(),
          method: request.method,
          url,
          auth: authMode,
          duration,
          error: errorMessage,
        });

        // Still return a response even on error
        return {
          status: error.response?.status || 500,
          statusText: error.response?.statusText || 'Internal Server Error',
          headers: (error.response?.headers as Record<string, string>) || {},
          data: error.response?.data || { error: errorMessage },
          duration,
        };
      }

      logger.error('API call failed', error);
      throw error;
    }
  }

  /**
   * Get auth headers from override
   */
  private getOverrideAuthHeaders(override: { type: string; value: string }): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (override.type) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${override.value}`;
        break;
      case 'apiKey':
        headers['Authorization'] = override.value;
        break;
      default:
        headers['Authorization'] = override.value;
    }

    return headers;
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };

    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie', 'set-cookie'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Get auth manager
   */
  getAuthManager(): AuthManager {
    return this.authManager;
  }
}
