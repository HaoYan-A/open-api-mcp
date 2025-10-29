#!/usr/bin/env node

/**
 * Open API MCP Server
 * Provides AI access to OpenAPI specifications with OAuth 2.0 support
 */

import { config as loadEnv } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Config, AuthMode, OAuth2Flow } from './types.js';
import { logger } from './logger.js';
import { OpenAPILoader } from './openapi/loader.js';
import { OpenAPIParser } from './openapi/parser.js';
import { ApiCaller } from './api/caller.js';
import { registerTools } from './tools/index.js';

// Load environment variables
loadEnv();

/**
 * Load configuration from environment variables
 */
function loadConfig(): Config {
  const authMode = (process.env.AUTH_MODE || 'none') as AuthMode;

  const config: Config = {
    openApiSpecUrl: process.env.OPENAPI_SPEC_URL || '',
    authMode,
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    logRequests: process.env.LOG_REQUESTS !== 'false',
    logResponses: process.env.LOG_RESPONSES !== 'false',
  };

  // API Key config
  if (authMode === 'apiKey') {
    config.apiKey = process.env.API_KEY;
    config.apiKeyHeader = process.env.API_KEY_HEADER || 'Authorization';
    config.apiKeyPrefix = process.env.API_KEY_PREFIX;
  }

  // Bearer Token config
  if (authMode === 'bearer') {
    config.bearerToken = process.env.BEARER_TOKEN;
  }

  // Basic Auth config
  if (authMode === 'basic') {
    config.basicAuthUser = process.env.BASIC_AUTH_USER;
    config.basicAuthPass = process.env.BASIC_AUTH_PASS;
  }

  // OAuth 2.0 config
  if (authMode === 'oauth2') {
    config.oauth = {
      flow: (process.env.OAUTH_FLOW || 'clientCredentials') as OAuth2Flow,
      clientId: process.env.OAUTH_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      username: process.env.OAUTH_USERNAME,
      password: process.env.OAUTH_PASSWORD,
      tokenUrl: process.env.OAUTH_TOKEN_URL,
      authUrl: process.env.OAUTH_AUTH_URL,
      redirectUri: process.env.OAUTH_REDIRECT_URI,
      scope: process.env.OAUTH_SCOPE,
      code: process.env.OAUTH_CODE,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    };
  }

  // Custom headers
  if (process.env.CUSTOM_HEADERS) {
    try {
      config.customHeaders = JSON.parse(process.env.CUSTOM_HEADERS);
    } catch (error) {
      logger.warn('Failed to parse CUSTOM_HEADERS, ignoring');
    }
  }

  return config;
}

/**
 * Main server initialization
 */
async function main() {
  try {
    logger.info('Starting Open API MCP Server...');

    // Load configuration
    const config = loadConfig();

    if (!config.openApiSpecUrl) {
      throw new Error('OPENAPI_SPEC_URL environment variable is required');
    }

    logger.info(`OpenAPI Spec URL: ${config.openApiSpecUrl}`);
    logger.info(`Auth Mode: ${config.authMode}`);

    // Create MCP server
    const server = new Server(
      {
        name: 'open-api-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Load and parse OpenAPI document
    logger.info('Loading OpenAPI document...');
    const loader = new OpenAPILoader(config.openApiSpecUrl);
    const document = await loader.load();

    const parser = new OpenAPIParser(document);
    const info = parser.getInfo();

    logger.info(`Loaded: ${info.title} v${info.version}`);
    logger.info(`Base URL: ${info.baseUrl}`);
    logger.info(`Total endpoints: ${info.totalEndpoints}`);
    logger.info(`Tags: ${info.tags.join(', ')}`);

    // Create API caller
    const apiCaller = new ApiCaller(parser.getBaseUrl(), config);

    // Register tools
    registerTools(server, parser, apiCaller, loader);

    logger.info('MCP tools registered successfully');

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Open API MCP Server is running');

    // Log auth status
    const authStatus = await apiCaller.getAuthManager().getAuthStatus();
    logger.debug('Auth status:', authStatus);

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  process.exit(0);
});

// Start the server
main();
