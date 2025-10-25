# Quick Start Guide

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 构建项目

```bash
npm run build
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置您的 OpenAPI 文档 URL 和认证信息。

### 4. 测试本地 API

如果您有本地运行的 OpenAPI 文档（如 `http://127.0.0.1/v3/api-docs`）：

```bash
# 创建配置
cat > .env << 'EOF'
OPENAPI_SPEC_URL=http://127.0.0.1/v3/api-docs
AUTH_MODE=none
LOG_LEVEL=info
LOG_REQUESTS=true
LOG_RESPONSES=false
EOF

# 启动服务器
npm start
```

### 5. 使用 MCP Inspector 测试

```bash
npm run inspect
```

这将启动 MCP Inspector，您可以在浏览器中测试所有工具。

## 🔧 常见使用场景

### 场景 1: 无认证的公开 API

```env
OPENAPI_SPEC_URL=https://api.example.com/openapi.json
AUTH_MODE=none
```

### 场景 2: API Key 认证

```env
OPENAPI_SPEC_URL=https://api.example.com/openapi.json
AUTH_MODE=apiKey
API_KEY=your-api-key-here
API_KEY_HEADER=Authorization
API_KEY_PREFIX=Bearer
```

### 场景 3: OAuth 2.0 Client Credentials（推荐用于服务器间通信）

```env
OPENAPI_SPEC_URL=https://api.example.com/openapi.json
AUTH_MODE=oauth2
OAUTH_FLOW=clientCredentials
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
OAUTH_SCOPE=api.read api.write
```

### 场景 4: OAuth 2.0 Password Flow

```env
OPENAPI_SPEC_URL=https://api.example.com/openapi.json
AUTH_MODE=oauth2
OAUTH_FLOW=password
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_USERNAME=user@example.com
OAUTH_PASSWORD=your-password
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
```

## 🎯 测试工具

### 使用 `listApi` 查看所有 API

在 MCP Inspector 中或通过 Claude Desktop：

```
使用 listApi 工具查看前 10 个 API 端点：
{
  "limit": 10,
  "offset": 0
}
```

### 使用 `searchApi` 搜索 API

```
搜索包含 "user" 的 API：
{
  "query": "user",
  "method": "GET"
}
```

### 使用 `getApiSchema` 获取详细信息

```
获取 /api/users 的 GET 方法详细信息：
{
  "path": "/api/users",
  "method": "GET"
}
```

### 使用 `callApi` 调用 API

```
调用 API 创建用户：
{
  "path": "/api/users",
  "method": "POST",
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## 🔌 集成到 Claude Desktop

1. 构建项目：
```bash
npm run build
```

2. 找到 Claude Desktop 配置文件：
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

3. 添加配置：
```json
{
  "mcpServers": {
    "open-api": {
      "command": "node",
      "args": ["/absolute/path/to/open-api-mcp/dist/index.js"],
      "env": {
        "OPENAPI_SPEC_URL": "http://127.0.0.1/v3/api-docs",
        "AUTH_MODE": "oauth2",
        "OAUTH_FLOW": "clientCredentials",
        "OAUTH_CLIENT_ID": "your-client-id",
        "OAUTH_CLIENT_SECRET": "your-client-secret",
        "OAUTH_TOKEN_URL": "https://auth.example.com/oauth/token",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

4. 重启 Claude Desktop

5. 现在您可以在对话中使用 API 工具了！

## 💡 实用技巧

### 1. 调试模式

启用详细日志：

```env
LOG_LEVEL=debug
LOG_REQUESTS=true
LOG_RESPONSES=true
```

### 2. 测试 OAuth 2.0 认证

使用 `getAuthStatus` 工具检查认证状态：

```
检查当前认证状态
```

返回示例：
```json
{
  "mode": "oauth2",
  "configured": true,
  "details": {
    "flow": "clientCredentials",
    "hasToken": true,
    "isValid": true,
    "expiresAt": "2025-10-25T14:30:00.000Z",
    "hasRefreshToken": false
  }
}
```

### 3. 查看 API 文档信息

使用 `getApiInfo` 工具：

```
获取 API 文档信息
```

返回示例：
```json
{
  "title": "My API",
  "version": "1.0.0",
  "baseUrl": "http://127.0.0.1",
  "totalEndpoints": 227,
  "tags": ["users", "products", "orders"]
}
```

## 🐛 故障排除

### 问题：无法加载 OpenAPI 文档

**检查：**
1. URL 是否正确
2. 服务器是否运行
3. 网络连接是否正常

**解决：**
```bash
# 测试 URL 是否可访问
curl http://127.0.0.1/v3/api-docs

# 查看详细日志
LOG_LEVEL=debug npm start
```

### 问题：OAuth 认证失败

**检查：**
1. Client ID 和 Secret 是否正确
2. Token URL 是否正确
3. Scope 是否有效

**解决：**
```bash
# 使用 debug 日志查看详细错误
LOG_LEVEL=debug npm start
```

### 问题：API 调用返回 401

**检查：**
1. 认证配置是否正确
2. Token 是否过期
3. 使用 `getAuthStatus` 查看认证状态

## 📚 更多资源

- [完整文档](./README.md)
- [环境变量配置](./.env.example)
- [MCP 官方文档](https://modelcontextprotocol.io)

## 🤝 支持

遇到问题？
1. 检查日志输出
2. 查看 [README.md](./README.md) 中的故障排除部分
3. 提交 Issue
