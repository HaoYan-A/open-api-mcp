/**
 * OAuth 2.0 handler - orchestrates different flows and token refresh
 */

import axios from 'axios';
import type { OAuth2Config, OAuth2TokenResponse } from '../types.js';
import { logger } from '../logger.js';
import { TokenManager } from './token-manager.js';
import { executePasswordFlow } from './flows/password.js';
import { executeClientCredentialsFlow } from './flows/client-credentials.js';
import { executeAuthorizationCodeFlow, getAuthorizationUrl } from './flows/authorization-code.js';

export class OAuth2Handler {
  private config: OAuth2Config;
  private tokenManager: TokenManager;

  constructor(config: OAuth2Config) {
    this.config = config;
    this.tokenManager = new TokenManager();
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    const existingToken = this.tokenManager.getAccessToken();
    if (existingToken && !this.tokenManager.isExpired()) {
      return existingToken;
    }

    // Try to refresh if we have a refresh token
    if (this.tokenManager.isExpired() && this.tokenManager.getRefreshToken()) {
      try {
        await this.refreshToken();
        const refreshedToken = this.tokenManager.getAccessToken();
        if (refreshedToken) {
          return refreshedToken;
        }
      } catch (error) {
        logger.warn('Token refresh failed, will try to get new token');
      }
    }

    // Get a new token using the configured flow
    await this.executeFlow();

    const newToken = this.tokenManager.getAccessToken();
    if (!newToken) {
      throw new Error('Failed to obtain access token');
    }

    return newToken;
  }

  /**
   * Execute the OAuth 2.0 flow based on configuration
   */
  async executeFlow(): Promise<OAuth2TokenResponse> {
    let tokenResponse: OAuth2TokenResponse;

    switch (this.config.flow) {
      case 'password':
        tokenResponse = await executePasswordFlow(this.config);
        break;

      case 'clientCredentials':
        tokenResponse = await executeClientCredentialsFlow(this.config);
        break;

      case 'authorizationCode':
        tokenResponse = await executeAuthorizationCodeFlow(this.config);
        break;

      case 'implicit':
        throw new Error('Implicit flow is not supported in server-side applications. Please use authorization code flow instead.');

      default:
        throw new Error(`Unsupported OAuth 2.0 flow: ${this.config.flow}`);
    }

    this.tokenManager.storeToken(tokenResponse);
    return tokenResponse;
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshToken(): Promise<OAuth2TokenResponse> {
    const refreshToken = this.tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (!this.config.tokenUrl) {
      throw new Error('Token URL is required for token refresh');
    }

    logger.info('Refreshing access token');

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    if (this.config.clientId) {
      params.append('client_id', this.config.clientId);
    }

    if (this.config.clientSecret) {
      params.append('client_secret', this.config.clientSecret);
    }

    try {
      const response = await axios.post<OAuth2TokenResponse>(this.config.tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      logger.info('Token refreshed successfully');
      this.tokenManager.storeToken(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error_description || error.response?.data?.error || error.message;
        logger.error(`Token refresh failed: ${message}`);
        throw new Error(`Token refresh failed: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Get authorization URL for authorization code flow
   */
  getAuthorizationUrl(): string {
    if (this.config.flow !== 'authorizationCode') {
      throw new Error('Authorization URL is only available for authorization code flow');
    }

    return getAuthorizationUrl(this.config);
  }

  /**
   * Get token info
   */
  getTokenInfo() {
    return this.tokenManager.getTokenInfo();
  }

  /**
   * Clear token
   */
  clearToken(): void {
    this.tokenManager.clearToken();
  }
}
