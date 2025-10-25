/**
 * MCP Tools registration and definitions
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { OpenAPIParser } from '../openapi/parser.js';
import type { ApiCaller } from '../api/caller.js';
import { logger } from '../logger.js';

export function registerTools(
  server: Server,
  parser: OpenAPIParser,
  apiCaller: ApiCaller
): void {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'listApi',
          description: 'List all available API endpoints with optional filtering by tag. Supports pagination.',
          inputSchema: {
            type: 'object',
            properties: {
              tag: {
                type: 'string',
                description: 'Filter by tag name (case-insensitive partial match)',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 50)',
              },
              offset: {
                type: 'number',
                description: 'Number of results to skip (default: 0)',
              },
            },
          },
        },
        {
          name: 'searchApi',
          description: 'Search for API endpoints by keyword in path, summary, description, or tags',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (case-insensitive)',
              },
              method: {
                type: 'string',
                description: 'Filter by HTTP method (GET, POST, PUT, DELETE, etc.)',
              },
              tag: {
                type: 'string',
                description: 'Filter by tag name',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'getApiSchema',
          description: 'Get detailed schema information for a specific API endpoint including parameters, request body, and responses',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'API path (e.g., /users/{id})',
              },
              method: {
                type: 'string',
                description: 'HTTP method (GET, POST, PUT, DELETE, etc.)',
              },
            },
            required: ['path', 'method'],
          },
        },
        {
          name: 'callApi',
          description: 'Call an API endpoint with authentication. Automatically handles OAuth 2.0 token management.',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'API path (e.g., /users or /users/123)',
              },
              method: {
                type: 'string',
                description: 'HTTP method (GET, POST, PUT, DELETE, etc.)',
              },
              params: {
                type: 'object',
                description: 'Query parameters as key-value pairs',
              },
              body: {
                description: 'Request body (JSON object or any data)',
              },
              headers: {
                type: 'object',
                description: 'Additional HTTP headers',
              },
            },
            required: ['path', 'method'],
          },
        },
        {
          name: 'getAuthStatus',
          description: 'Get current authentication status and configuration details',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'getApiInfo',
          description: 'Get OpenAPI document information including title, version, base URL, and available tags',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      switch (request.params.name) {
        case 'listApi': {
          const args = request.params.arguments as {
            tag?: string;
            limit?: number;
            offset?: number;
          };

          const result = parser.listEndpoints({
            tag: args.tag,
            limit: args.limit,
            offset: args.offset,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'searchApi': {
          const args = request.params.arguments as {
            query: string;
            method?: string;
            tag?: string;
          };

          if (!args.query) {
            throw new Error('query is required');
          }

          const results = parser.searchEndpoints({
            query: args.query,
            method: args.method,
            tag: args.tag,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        }

        case 'getApiSchema': {
          const args = request.params.arguments as {
            path: string;
            method: string;
          };

          if (!args.path || !args.method) {
            throw new Error('path and method are required');
          }

          const schema = parser.getEndpointSchema(args.path, args.method);

          if (!schema) {
            throw new Error(`Endpoint not found: ${args.method} ${args.path}`);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(schema, null, 2),
              },
            ],
          };
        }

        case 'callApi': {
          const args = request.params.arguments as {
            path: string;
            method: string;
            params?: Record<string, any>;
            body?: any;
            headers?: Record<string, string>;
          };

          if (!args.path || !args.method) {
            throw new Error('path and method are required');
          }

          const response = await apiCaller.call({
            path: args.path,
            method: args.method,
            params: args.params,
            body: args.body,
            headers: args.headers,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        }

        case 'getAuthStatus': {
          const authManager = apiCaller.getAuthManager();
          const status = await authManager.getAuthStatus();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(status, null, 2),
              },
            ],
          };
        }

        case 'getApiInfo': {
          const info = parser.getInfo();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(info, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      logger.error(`Tool execution failed: ${request.params.name}`, error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: errorMessage,
                tool: request.params.name,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });
}
