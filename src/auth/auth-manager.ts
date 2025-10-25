/**
 * Authentication manager - handles all auth modes
 */

import type { Config, AuthMode } from '../types.js';
import { logger } from '../logger.js';
import { OAuth2Handler } from './oauth2-handler.js';

export class AuthManager {
  private config: Config;
  private oauth2Handler?: OAuth2Handler;

  constructor(config: Config) {
    this.config = config;

    // Initialize OAuth2 handler if needed
    if (config.authMode === 'oauth2' && config.oauth) {
      this.oauth2Handler = new OAuth2Handler(config.oauth);
    }
  }

  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    switch (this.config.authMode) {
      case 'apiKey':
        if (this.config.apiKey && this.config.apiKeyHeader) {
          const value = this.config.apiKeyPrefix
            ? `${this.config.apiKeyPrefix} ${this.config.apiKey}`
            : this.config.apiKey;
          headers[this.config.apiKeyHeader] = value;
          logger.debug(`Using API Key authentication (header: ${this.config.apiKeyHeader})`);
        }
        break;

      case 'bearer':
        if (this.config.bearerToken) {
          headers['Authorization'] = `Bearer ${this.config.bearerToken}`;
          logger.debug('Using Bearer token authentication');
        }
        break;

      case 'basic':
        if (this.config.basicAuthUser && this.config.basicAuthPass) {
          const credentials = Buffer.from(
            `${this.config.basicAuthUser}:${this.config.basicAuthPass}`
          ).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
          logger.debug('Using Basic authentication');
        }
        break;

      case 'oauth2':
        if (this.oauth2Handler) {
          const accessToken = await this.oauth2Handler.getAccessToken();
          headers['Authorization'] = `Bearer ${accessToken}`;
          logger.debug('Using OAuth 2.0 authentication');
        }
        break;

      case 'none':
        logger.debug('No authentication configured');
        break;

      default:
        logger.warn(`Unknown auth mode: ${this.config.authMode}`);
    }

    // Add custom headers
    if (this.config.customHeaders) {
      Object.assign(headers, this.config.customHeaders);
    }

    return headers;
  }

  /**
   * Get authentication mode
   */
  getAuthMode(): AuthMode {
    return this.config.authMode;
  }

  /**
   * Get authentication status and info
   */
  async getAuthStatus(): Promise<{
    mode: AuthMode;
    configured: boolean;
    details?: any;
  }> {
    const mode = this.config.authMode;
    let configured = false;
    let details: any = {};

    switch (mode) {
      case 'apiKey':
        configured = !!(this.config.apiKey && this.config.apiKeyHeader);
        details = {
          header: this.config.apiKeyHeader,
          hasPrefix: !!this.config.apiKeyPrefix,
        };
        break;

      case 'bearer':
        configured = !!this.config.bearerToken;
        break;

      case 'basic':
        configured = !!(this.config.basicAuthUser && this.config.basicAuthPass);
        details = {
          username: this.config.basicAuthUser,
        };
        break;

      case 'oauth2':
        if (this.oauth2Handler) {
          configured = true;
          details = {
            flow: this.config.oauth?.flow,
            ...this.oauth2Handler.getTokenInfo(),
          };
        }
        break;

      case 'none':
        configured = true;
        break;
    }

    return {
      mode,
      configured,
      details,
    };
  }

  /**
   * Refresh OAuth 2.0 token manually
   */
  async refreshOAuth2Token(): Promise<void> {
    if (!this.oauth2Handler) {
      throw new Error('OAuth 2.0 is not configured');
    }

    await this.oauth2Handler.refreshToken();
  }

  /**
   * Get OAuth 2.0 authorization URL (for authorization code flow)
   */
  getOAuth2AuthorizationUrl(): string {
    if (!this.oauth2Handler) {
      throw new Error('OAuth 2.0 is not configured');
    }

    return this.oauth2Handler.getAuthorizationUrl();
  }

  /**
   * Clear OAuth 2.0 token
   */
  clearOAuth2Token(): void {
    if (this.oauth2Handler) {
      this.oauth2Handler.clearToken();
    }
  }
}
