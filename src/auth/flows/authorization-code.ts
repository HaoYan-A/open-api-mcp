/**
 * OAuth 2.0 Authorization Code Flow
 */

import axios from 'axios';
import type { OAuth2Config, OAuth2TokenResponse } from '../../types.js';
import { logger } from '../../logger.js';

export async function executeAuthorizationCodeFlow(config: OAuth2Config): Promise<OAuth2TokenResponse> {
  if (!config.tokenUrl) {
    throw new Error('Token URL is required for authorization code flow');
  }

  if (!config.clientId) {
    throw new Error('Client ID is required for authorization code flow');
  }

  if (!config.code) {
    throw new Error('Authorization code is required. Please set OAUTH_CODE environment variable after completing authorization.');
  }

  logger.info('Executing OAuth 2.0 Authorization Code Flow');

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: config.code,
    client_id: config.clientId,
  });

  if (config.clientSecret) {
    params.append('client_secret', config.clientSecret);
  }

  if (config.redirectUri) {
    params.append('redirect_uri', config.redirectUri);
  }

  try {
    const response = await axios.post<OAuth2TokenResponse>(config.tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    logger.info('Authorization code flow completed successfully');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error_description || error.response?.data?.error || error.message;
      logger.error(`Authorization code flow failed: ${message}`);
      throw new Error(`OAuth 2.0 authorization code flow failed: ${message}`);
    }
    throw error;
  }
}

export function getAuthorizationUrl(config: OAuth2Config): string {
  if (!config.authUrl) {
    throw new Error('Authorization URL is required for authorization code flow');
  }

  if (!config.clientId) {
    throw new Error('Client ID is required for authorization code flow');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
  });

  if (config.redirectUri) {
    params.append('redirect_uri', config.redirectUri);
  }

  if (config.scope) {
    params.append('scope', config.scope);
  }

  // Add state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  params.append('state', state);

  return `${config.authUrl}?${params.toString()}`;
}
