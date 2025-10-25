/**
 * OAuth 2.0 token storage and management
 */

import type { StoredToken, OAuth2TokenResponse } from '../types.js';
import { logger } from '../logger.js';

export class TokenManager {
  private token: StoredToken | null = null;

  /**
   * Store a token from OAuth 2.0 response
   */
  storeToken(tokenResponse: OAuth2TokenResponse): void {
    const expiresAt = tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : undefined;

    this.token = {
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type,
      expiresAt,
      refreshToken: tokenResponse.refresh_token,
      scope: tokenResponse.scope,
    };

    const expiryInfo = expiresAt
      ? `expires at ${new Date(expiresAt).toISOString()}`
      : 'no expiry';

    logger.info(`Token stored successfully (${expiryInfo})`);
  }

  /**
   * Get current token if valid
   */
  getToken(): StoredToken | null {
    if (!this.token) {
      return null;
    }

    // Check if token has expired
    if (this.token.expiresAt && Date.now() >= this.token.expiresAt) {
      logger.warn('Token has expired');
      return null;
    }

    return this.token;
  }

  /**
   * Get access token string if valid
   */
  getAccessToken(): string | null {
    const token = this.getToken();
    return token?.accessToken || null;
  }

  /**
   * Check if token is valid (exists and not expired)
   */
  isValid(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Check if token is expired or about to expire (within buffer time)
   */
  isExpired(bufferSeconds: number = 60): boolean {
    if (!this.token) {
      return true;
    }

    if (!this.token.expiresAt) {
      return false; // No expiry means never expired
    }

    const bufferMs = bufferSeconds * 1000;
    return Date.now() + bufferMs >= this.token.expiresAt;
  }

  /**
   * Get refresh token if available
   */
  getRefreshToken(): string | null {
    return this.token?.refreshToken || null;
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    this.token = null;
    logger.debug('Token cleared');
  }

  /**
   * Get token info for debugging
   */
  getTokenInfo(): {
    hasToken: boolean;
    isValid: boolean;
    expiresAt?: string;
    hasRefreshToken: boolean;
    scope?: string;
  } {
    const hasToken = this.token !== null;
    const isValid = this.isValid();
    const expiresAt = this.token?.expiresAt
      ? new Date(this.token.expiresAt).toISOString()
      : undefined;
    const hasRefreshToken = !!this.token?.refreshToken;
    const scope = this.token?.scope;

    return {
      hasToken,
      isValid,
      expiresAt,
      hasRefreshToken,
      scope,
    };
  }
}
