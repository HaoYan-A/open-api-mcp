/**
 * Type definitions for Open API MCP Server
 */

import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

// Union type for OpenAPI documents
export type OpenAPIDocument = OpenAPIV3.Document | OpenAPIV3_1.Document;

// Authentication modes
export type AuthMode = 'apiKey' | 'oauth2' | 'bearer' | 'basic' | 'none';

// OAuth 2.0 flow types
export type OAuth2Flow = 'password' | 'clientCredentials' | 'authorizationCode' | 'implicit';

// Environment configuration
export interface Config {
  openApiSpecUrl: string;
  authMode: AuthMode;

  // API Key
  apiKey?: string;
  apiKeyHeader?: string;
  apiKeyPrefix?: string;

  // Bearer Token
  bearerToken?: string;

  // Basic Auth
  basicAuthUser?: string;
  basicAuthPass?: string;

  // OAuth 2.0
  oauth?: OAuth2Config;

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRequests: boolean;
  logResponses: boolean;

  // Custom headers
  customHeaders?: Record<string, string>;
}

// OAuth 2.0 configuration
export interface OAuth2Config {
  flow: OAuth2Flow;
  clientId: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  tokenUrl?: string;
  authUrl?: string;
  redirectUri?: string;
  scope?: string;
  code?: string;
  refreshToken?: string;
}

// OAuth 2.0 token response
export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

// Stored token with expiry
export interface StoredToken {
  accessToken: string;
  tokenType: string;
  expiresAt?: number;
  refreshToken?: string;
  scope?: string;
}

// API endpoint information
export interface ApiEndpoint {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  security?: Array<Record<string, string[]>>;
}

// API schema details
export interface ApiSchemaDetails {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content?: Record<string, { schema?: any }>;
  };
  responses?: Record<string, {
    description?: string;
    content?: Record<string, { schema?: any }>;
  }>;
  security?: Array<Record<string, string[]>>;
}

// API call request
export interface ApiCallRequest {
  path: string;
  method: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  authOverride?: {
    type: AuthMode;
    value: string;
  };
}

// API call response
export interface ApiCallResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}

// Request log entry
export interface RequestLogEntry {
  timestamp: string;
  method: string;
  url: string;
  auth: string;
  status?: number;
  duration?: number;
  request?: {
    params?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
  };
  response?: {
    status: number;
    statusText: string;
    data?: any;
  };
  error?: string;
}

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Search options
export interface SearchOptions {
  query: string;
  method?: string;
  tag?: string;
}

// List options
export interface ListOptions {
  tag?: string;
  limit?: number;
  offset?: number;
}
