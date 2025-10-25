/**
 * OAuth 2.0 Password Flow (Resource Owner Password Credentials)
 */

import axios from 'axios';
import type { OAuth2Config, OAuth2TokenResponse } from '../../types.js';
import { logger } from '../../logger.js';

export async function executePasswordFlow(config: OAuth2Config): Promise<OAuth2TokenResponse> {
  if (!config.tokenUrl) {
    throw new Error('Token URL is required for password flow');
  }

  if (!config.username || !config.password) {
    throw new Error('Username and password are required for password flow');
  }

  if (!config.clientId) {
    throw new Error('Client ID is required for password flow');
  }

  logger.info('Executing OAuth 2.0 Password Flow');

  const params = new URLSearchParams({
    grant_type: 'password',
    username: config.username,
    password: config.password,
    client_id: config.clientId,
  });

  if (config.clientSecret) {
    params.append('client_secret', config.clientSecret);
  }

  if (config.scope) {
    params.append('scope', config.scope);
  }

  try {
    const response = await axios.post<OAuth2TokenResponse>(config.tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    logger.info('Password flow completed successfully');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error_description || error.response?.data?.error || error.message;
      logger.error(`Password flow failed: ${message}`);
      throw new Error(`OAuth 2.0 password flow failed: ${message}`);
    }
    throw error;
  }
}
