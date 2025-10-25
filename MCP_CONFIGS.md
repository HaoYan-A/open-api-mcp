# MCP 配置示例

本项目提供了多种 MCP 配置格式，适用于不同的使用场景。

## 📁 配置文件列表

### 1. **mcp-config.json** - 无认证配置（测试）

```json
{
  "command": "node",
  "args": [
    "/Users/yanhao/Documents/codes/open-api-mcp/dist/index.js"
  ],
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "none",
    "LOG_LEVEL": "info",
    "LOG_REQUESTS": "true",
    "LOG_RESPONSES": "false"
  }
}
```

### 2. **mcp-config-oauth.json** - OAuth 2.0 配置

```json
{
  "command": "node",
  "args": [
    "/Users/yanhao/Documents/codes/open-api-mcp/dist/index.js"
  ],
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "oauth2",
    "OAUTH_FLOW": "clientCredentials",
    "OAUTH_CLIENT_ID": "<YOUR_CLIENT_ID>",
    "OAUTH_CLIENT_SECRET": "<YOUR_CLIENT_SECRET>",
    "OAUTH_TOKEN_URL": "https://auth.example.com/oauth/token",
    "OAUTH_SCOPE": "read write",
    "LOG_LEVEL": "info",
    "LOG_REQUESTS": "true",
    "LOG_RESPONSES": "false"
  }
}
```

### 3. **mcp-config-apikey.json** - API Key 配置

```json
{
  "command": "node",
  "args": [
    "/Users/yanhao/Documents/codes/open-api-mcp/dist/index.js"
  ],
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "apiKey",
    "API_KEY": "<YOUR_API_KEY>",
    "API_KEY_HEADER": "Authorization",
    "API_KEY_PREFIX": "Bearer",
    "LOG_LEVEL": "info",
    "LOG_REQUESTS": "true",
    "LOG_RESPONSES": "false"
  }
}
```

## 🔧 在 Claude Desktop 中使用

### 完整配置示例

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "open-api-mcp": {
      "command": "node",
      "args": [
        "/Users/yanhao/Documents/codes/open-api-mcp/dist/index.js"
      ],
      "env": {
        "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
        "AUTH_MODE": "none",
        "LOG_LEVEL": "info",
        "LOG_REQUESTS": "true",
        "LOG_RESPONSES": "false"
      }
    }
  }
}
```

### 多个 API 配置

如果您有多个 OpenAPI 服务，可以这样配置：

```json
{
  "mcpServers": {
    "local-api": {
      "command": "node",
      "args": [
        "/Users/yanhao/Documents/codes/open-api-mcp/dist/index.js"
      ],
      "env": {
        "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
        "AUTH_MODE": "none"
      }
    },
    "production-api": {
      "command": "node",
      "args": [
        "/Users/yanhao/Documents/codes/open-api-mcp/dist/index.js"
      ],
      "env": {
        "OPENAPI_SPEC_URL": "https://api.production.com/openapi.json",
        "AUTH_MODE": "oauth2",
        "OAUTH_FLOW": "clientCredentials",
        "OAUTH_CLIENT_ID": "prod-client-id",
        "OAUTH_CLIENT_SECRET": "prod-secret",
        "OAUTH_TOKEN_URL": "https://auth.production.com/oauth/token"
      }
    }
  }
}
```

## 🔐 所有认证模式配置

### 无认证

```json
{
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "none"
  }
}
```

### API Key

```json
{
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "apiKey",
    "API_KEY": "your-api-key",
    "API_KEY_HEADER": "Authorization",
    "API_KEY_PREFIX": "Bearer"
  }
}
```

### Bearer Token

```json
{
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "bearer",
    "BEARER_TOKEN": "your-bearer-token"
  }
}
```

### Basic Authentication

```json
{
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "basic",
    "BASIC_AUTH_USER": "username",
    "BASIC_AUTH_PASS": "password"
  }
}
```

### OAuth 2.0 - Client Credentials

```json
{
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "oauth2",
    "OAUTH_FLOW": "clientCredentials",
    "OAUTH_CLIENT_ID": "client-id",
    "OAUTH_CLIENT_SECRET": "client-secret",
    "OAUTH_TOKEN_URL": "https://auth.example.com/oauth/token",
    "OAUTH_SCOPE": "read write"
  }
}
```

### OAuth 2.0 - Password Flow

```json
{
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "oauth2",
    "OAUTH_FLOW": "password",
    "OAUTH_CLIENT_ID": "client-id",
    "OAUTH_CLIENT_SECRET": "client-secret",
    "OAUTH_USERNAME": "user@example.com",
    "OAUTH_PASSWORD": "password",
    "OAUTH_TOKEN_URL": "https://auth.example.com/oauth/token",
    "OAUTH_SCOPE": "read write"
  }
}
```

### OAuth 2.0 - Authorization Code

```json
{
  "env": {
    "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
    "AUTH_MODE": "oauth2",
    "OAUTH_FLOW": "authorizationCode",
    "OAUTH_CLIENT_ID": "client-id",
    "OAUTH_CLIENT_SECRET": "client-secret",
    "OAUTH_AUTH_URL": "https://auth.example.com/oauth/authorize",
    "OAUTH_TOKEN_URL": "https://auth.example.com/oauth/token",
    "OAUTH_REDIRECT_URI": "http://localhost:3000/callback",
    "OAUTH_CODE": "authorization-code-from-callback"
  }
}
```

## 📝 环境变量说明

| 变量名 | 必需 | 说明 | 默认值 |
|--------|------|------|--------|
| `OPENAPI_SPEC_URL` | ✅ | OpenAPI 文档 URL | - |
| `AUTH_MODE` | ❌ | 认证模式 | `none` |
| `LOG_LEVEL` | ❌ | 日志级别 (debug/info/warn/error) | `info` |
| `LOG_REQUESTS` | ❌ | 记录请求 | `true` |
| `LOG_RESPONSES` | ❌ | 记录响应 | `false` |

### API Key 相关

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `API_KEY` | ✅ | API Key |
| `API_KEY_HEADER` | ❌ | Header 名称 (默认: Authorization) |
| `API_KEY_PREFIX` | ❌ | 前缀 (如: Bearer) |

### OAuth 2.0 相关

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `OAUTH_FLOW` | ✅ | Flow 类型 (clientCredentials/password/authorizationCode) |
| `OAUTH_CLIENT_ID` | ✅ | Client ID |
| `OAUTH_CLIENT_SECRET` | ❌ | Client Secret (大多数 flow 需要) |
| `OAUTH_TOKEN_URL` | ✅ | Token 端点 URL |
| `OAUTH_AUTH_URL` | ❌ | 授权端点 URL (authorizationCode flow) |
| `OAUTH_USERNAME` | ❌ | 用户名 (password flow) |
| `OAUTH_PASSWORD` | ❌ | 密码 (password flow) |
| `OAUTH_SCOPE` | ❌ | OAuth scopes |
| `OAUTH_REDIRECT_URI` | ❌ | 回调 URI (authorizationCode flow) |
| `OAUTH_CODE` | ❌ | 授权码 (authorizationCode flow) |

## 🚀 快速使用

1. **选择配置文件**（根据您的认证需求）
2. **修改必要的值**（如 URL、凭证等）
3. **复制到 Claude Desktop 配置**
4. **重启 Claude Desktop**

## 💡 提示

- 使用 `LOG_LEVEL=debug` 进行调试
- 敏感信息（如密码、token）会在日志中自动脱敏
- 建议生产环境关闭响应日志 (`LOG_RESPONSES=false`)
