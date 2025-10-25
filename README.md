# Open API MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with access to OpenAPI specifications, supporting OAuth 2.0 authentication flows.

## Features

- 📖 **OpenAPI Support**: Load and parse OpenAPI 2.0, 3.0, and 3.1 specifications
- 🔐 **OAuth 2.0 Authentication**: Full support for Password, Client Credentials, and Authorization Code flows
- 🔑 **Multiple Auth Methods**: API Key, Bearer Token, Basic Auth, and OAuth 2.0
- 🔍 **Smart Search**: Search and filter API endpoints by path, method, tags, or keywords
- 📝 **Detailed Schemas**: Get complete request/response schemas for any endpoint
- 🚀 **API Execution**: Call APIs directly with automatic authentication
- 📊 **Request Logging**: Track all API calls with detailed logs

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file in the project root:

```bash
# Required: OpenAPI Specification URL
OPENAPI_SPEC_URL=http://127.0.0.1/v3/api-docs

# Authentication Mode
# Options: none, apiKey, bearer, basic, oauth2
AUTH_MODE=oauth2

# OAuth 2.0 Configuration (if AUTH_MODE=oauth2)
OAUTH_FLOW=clientCredentials
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
OAUTH_SCOPE=read write

# Logging
LOG_LEVEL=info
LOG_REQUESTS=true
LOG_RESPONSES=true
```

### Authentication Modes

#### 1. OAuth 2.0 - Client Credentials Flow

Best for machine-to-machine communication:

```env
AUTH_MODE=oauth2
OAUTH_FLOW=clientCredentials
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
OAUTH_SCOPE=api.access
```

#### 2. OAuth 2.0 - Password Flow

For username/password authentication:

```env
AUTH_MODE=oauth2
OAUTH_FLOW=password
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_USERNAME=user@example.com
OAUTH_PASSWORD=your-password
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
OAUTH_SCOPE=read write
```

#### 3. OAuth 2.0 - Authorization Code Flow

For user authorization with redirect:

```env
AUTH_MODE=oauth2
OAUTH_FLOW=authorizationCode
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_AUTH_URL=https://auth.example.com/oauth/authorize
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
OAUTH_REDIRECT_URI=http://localhost:3000/callback
OAUTH_CODE=<authorization-code-from-redirect>
```

#### 4. API Key Authentication

```env
AUTH_MODE=apiKey
API_KEY=your-api-key
API_KEY_HEADER=Authorization
API_KEY_PREFIX=Bearer
```

#### 5. Bearer Token

```env
AUTH_MODE=bearer
BEARER_TOKEN=your-bearer-token
```

#### 6. Basic Authentication

```env
AUTH_MODE=basic
BASIC_AUTH_USER=username
BASIC_AUTH_PASS=password
```

## Usage

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start

# Test with MCP Inspector
npm run inspect
```

### Using with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "open-api": {
      "command": "node",
      "args": ["/path/to/open-api-mcp/dist/index.js"],
      "env": {
        "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
        "AUTH_MODE": "oauth2",
        "OAUTH_FLOW": "clientCredentials",
        "OAUTH_CLIENT_ID": "your-client-id",
        "OAUTH_CLIENT_SECRET": "your-client-secret",
        "OAUTH_TOKEN_URL": "https://auth.example.com/oauth/token"
      }
    }
  }
}
```

## MCP Tools

### 1. `listApi`

List all available API endpoints with optional filtering.

**Parameters:**
- `tag` (optional): Filter by tag name
- `limit` (optional): Maximum results (default: 50)
- `offset` (optional): Skip results (default: 0)

**Example:**
```json
{
  "tag": "users",
  "limit": 20
}
```

### 2. `searchApi`

Search for API endpoints by keyword.

**Parameters:**
- `query` (required): Search query
- `method` (optional): HTTP method filter
- `tag` (optional): Tag filter

**Example:**
```json
{
  "query": "user",
  "method": "GET"
}
```

### 3. `getApiSchema`

Get detailed schema for a specific endpoint.

**Parameters:**
- `path` (required): API path (e.g., `/users/{id}`)
- `method` (required): HTTP method

**Example:**
```json
{
  "path": "/api/users/{id}",
  "method": "GET"
}
```

### 4. `callApi`

Execute an API request with authentication.

**Parameters:**
- `path` (required): API path
- `method` (required): HTTP method
- `params` (optional): Query parameters
- `body` (optional): Request body
- `headers` (optional): Additional headers

**Example:**
```json
{
  "path": "/api/users",
  "method": "POST",
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 5. `getAuthStatus`

Get current authentication status and configuration.

### 6. `getApiInfo`

Get OpenAPI document information (title, version, base URL, tags).

## Project Structure

```
open-api-mcp/
├── src/
│   ├── auth/                 # Authentication management
│   │   ├── auth-manager.ts   # Main auth manager
│   │   ├── oauth2-handler.ts # OAuth 2.0 orchestrator
│   │   ├── token-manager.ts  # Token storage
│   │   └── flows/            # OAuth 2.0 flow implementations
│   ├── openapi/              # OpenAPI document handling
│   │   ├── loader.ts         # Load from URL
│   │   ├── parser.ts         # Parse and index
│   │   └── cache.ts          # Document caching
│   ├── api/                  # API execution
│   │   └── caller.ts         # HTTP client with auth
│   ├── tools/                # MCP tools
│   │   └── index.ts          # Tool registration
│   ├── logger.ts             # Logging utility
│   ├── types.ts              # TypeScript types
│   └── index.ts              # Main entry point
├── package.json
├── tsconfig.json
└── .env
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run watch

# Test with inspector
npm run inspect
```

## OAuth 2.0 Flow Details

### Token Management

- **Automatic Refresh**: Tokens are automatically refreshed when expired
- **Token Caching**: Valid tokens are cached to reduce auth requests
- **Expiry Buffer**: Tokens are refreshed 60 seconds before expiry

### Flow Selection Guide

- **Client Credentials**: Best for server-to-server, no user context
- **Password Flow**: For trusted applications with username/password
- **Authorization Code**: For user-authorized access with redirect flow

## Logging

The server provides detailed logging for debugging:

```env
# Log levels: debug, info, warn, error
LOG_LEVEL=debug

# Enable/disable request logging
LOG_REQUESTS=true

# Enable/disable response logging
LOG_RESPONSES=true
```

Request logs include:
- Timestamp
- HTTP method and URL
- Authentication mode
- Request parameters and body
- Response status and data
- Request duration

## Troubleshooting

### "Failed to load OpenAPI document"

- Verify `OPENAPI_SPEC_URL` is correct and accessible
- Check network connectivity
- Ensure the URL returns valid OpenAPI JSON/YAML

### "OAuth 2.0 flow failed"

- Verify OAuth credentials (client ID, secret)
- Check token URL is correct
- Ensure required scopes are available
- Review server logs for specific error messages

### "Token refresh failed"

- Verify refresh token is valid
- Check if refresh tokens are supported by the auth server
- Try re-authenticating to get a new token

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
