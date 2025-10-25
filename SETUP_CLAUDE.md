# Claude Desktop 配置指南

## 🎯 快速配置

我已经为您生成了两个配置文件：

### 1. `claude_desktop_config.json` - 无认证版本（测试用）
适用于本地测试，无需认证

### 2. `claude_desktop_config_oauth.json` - OAuth 2.0 版本
适用于生产环境，支持完整的 OAuth 2.0 认证

## 📝 配置步骤

### 方法一：直接复制配置（推荐）

1. **找到 Claude Desktop 配置文件位置：**

   - **macOS**:
     ```bash
     ~/Library/Application Support/Claude/claude_desktop_config.json
     ```

   - **Windows**:
     ```
     %APPDATA%\Claude\claude_desktop_config.json
     ```

2. **打开配置文件并添加配置：**

   如果文件不存在，创建它。然后添加以下内容：

   **无认证版本（测试）：**
   ```bash
   # macOS 命令
   cat claude_desktop_config.json
   ```

   复制输出的内容到 Claude Desktop 配置文件。

   **OAuth 2.0 版本（生产）：**
   ```bash
   # 复制 OAuth 配置
   cat claude_desktop_config_oauth.json
   ```

   记得替换：
   - `your-client-id-here`
   - `your-client-secret-here`
   - `https://your-auth-server.com/oauth/token`

### 方法二：自动配置（macOS）

```bash
# 备份现有配置（如果存在）
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup 2>/dev/null || true

# 复制无认证配置（测试）
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 或者复制 OAuth 配置（记得先修改凭证）
# cp claude_desktop_config_oauth.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## 🔄 重启 Claude Desktop

配置完成后，完全退出并重启 Claude Desktop：

1. 退出 Claude Desktop（macOS: Cmd+Q，Windows: Alt+F4）
2. 重新启动 Claude Desktop
3. 检查工具是否可用

## ✅ 验证配置

在 Claude Desktop 中输入：

```
列出所有可用的 API 工具
```

或者：

```
使用 getApiInfo 工具查看 API 信息
```

应该能看到以下工具：
- ✅ listApi
- ✅ searchApi
- ✅ getApiSchema
- ✅ callApi
- ✅ getAuthStatus
- ✅ getApiInfo

## 📋 配置详解

### 基础配置字段

```json
{
  "mcpServers": {
    "open-api-mcp": {                    // 服务器名称
      "command": "node",                  // 执行命令
      "args": ["完整路径/dist/index.js"], // 脚本路径
      "env": {                            // 环境变量
        "OPENAPI_SPEC_URL": "...",       // OpenAPI 文档 URL
        "AUTH_MODE": "...",               // 认证模式
        "LOG_LEVEL": "info"               // 日志级别
      }
    }
  }
}
```

### 认证模式选项

#### 1. 无认证
```json
"AUTH_MODE": "none"
```

#### 2. API Key
```json
"AUTH_MODE": "apiKey",
"API_KEY": "your-api-key",
"API_KEY_HEADER": "Authorization",
"API_KEY_PREFIX": "Bearer"
```

#### 3. Bearer Token
```json
"AUTH_MODE": "bearer",
"BEARER_TOKEN": "your-bearer-token"
```

#### 4. Basic Auth
```json
"AUTH_MODE": "basic",
"BASIC_AUTH_USER": "username",
"BASIC_AUTH_PASS": "password"
```

#### 5. OAuth 2.0 - Client Credentials
```json
"AUTH_MODE": "oauth2",
"OAUTH_FLOW": "clientCredentials",
"OAUTH_CLIENT_ID": "client-id",
"OAUTH_CLIENT_SECRET": "client-secret",
"OAUTH_TOKEN_URL": "https://auth.server.com/oauth/token",
"OAUTH_SCOPE": "read write"
```

#### 6. OAuth 2.0 - Password Flow
```json
"AUTH_MODE": "oauth2",
"OAUTH_FLOW": "password",
"OAUTH_CLIENT_ID": "client-id",
"OAUTH_CLIENT_SECRET": "client-secret",
"OAUTH_USERNAME": "user@example.com",
"OAUTH_PASSWORD": "password",
"OAUTH_TOKEN_URL": "https://auth.server.com/oauth/token",
"OAUTH_SCOPE": "read write"
```

## 🐛 故障排除

### 问题：工具没有出现

**解决方案：**
1. 确认配置文件路径正确
2. 确认 JSON 格式正确（使用 JSON 验证器）
3. 完全退出并重启 Claude Desktop
4. 检查 Claude Desktop 日志

### 问题：服务器启动失败

**检查：**
```bash
# 测试服务器是否能正常启动
cd /Users/yanhao/Documents/codes/open-api-mcp
node dist/index.js
```

如果看到错误，检查：
- OpenAPI URL 是否可访问
- 认证配置是否正确
- 环境变量是否设置正确

### 问题：OAuth 认证失败

**检查：**
1. Client ID 和 Secret 是否正确
2. Token URL 是否正确
3. Scope 是否有效
4. 网络连接是否正常

**调试：**
```json
// 在配置中启用详细日志
"LOG_LEVEL": "debug",
"LOG_REQUESTS": "true",
"LOG_RESPONSES": "true"
```

然后查看 Claude Desktop 的日志输出。

## 📊 使用示例

### 示例 1：列出所有 API

在 Claude 中：
```
使用 listApi 工具，只显示前 10 个 API
```

### 示例 2：搜索特定 API

```
搜索所有包含 "user" 的 GET 请求 API
```

### 示例 3：获取 API 详细信息

```
获取 /api/users 的 GET 方法的完整 schema
```

### 示例 4：调用 API

```
调用 POST /api/users 创建一个新用户，name 是 "张三"，email 是 "zhangsan@example.com"
```

### 示例 5：检查认证状态

```
查看当前的认证状态和配置
```

## 🎯 下一步

1. ✅ 配置已生成在项目目录
2. 📋 根据您的需求选择配置文件
3. 🔧 修改 OAuth 凭证（如果使用 OAuth）
4. 📂 复制到 Claude Desktop 配置目录
5. 🔄 重启 Claude Desktop
6. 🎉 开始使用！

## 💡 提示

- 如果您有多个 OpenAPI 服务，可以在 `mcpServers` 中添加多个配置，每个使用不同的名称
- 建议在测试时使用 `LOG_LEVEL: "debug"` 来查看详细日志
- 生产环境建议使用 `LOG_LEVEL: "info"` 或 `"warn"`

需要帮助？查看完整文档：[README.md](./README.md)
