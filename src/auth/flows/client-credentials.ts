/**
 * OAuth 2.0 Client Credentials Flow
 */

import axios from 'axios';
import type { OAuth2Config, OAuth2TokenResponse } from '../../types.js';
import { logger } from '../../logger.js';

export async function executeClientCredentialsFlow(config: OAuth2Config): Promise<OAuth2TokenResponse> {
  if (!config.tokenUrl) {
    throw new Error('Token URL is required for client credentials flow');
  }

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Client ID and client secret are required for client credentials flow');
  }

  logger.info('Executing OAuth 2.0 Client Credentials Flow');

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  if (config.scope) {
    params.append('scope', config.scope);
  }

  try {
    const response = await axios.post<OAuth2TokenResponse>(config.tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    logger.info('Client credentials flow completed successfully');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error_description || error.response?.data?.error || error.message;
      logger.error(`Client credentials flow failed: ${message}`);
      throw new Error(`OAuth 2.0 client credentials flow failed: ${message}`);
    }
    throw error;
  }
}
