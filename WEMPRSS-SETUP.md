# We-MP-RSS 微信公众号集成配置

## 概述

本项目已集成 We-MP-RSS 服务，用于从微信公众号「锦秋集」抓取文章并展示在 Library 页面。

## 架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   We-MP-RSS     │     │  jinqiucapital  │     │     用户        │
│   (8001端口)    │────▶│   (API Routes)  │────▶│   (浏览器)      │
│   微信文章抓取   │     │   文章转换展示   │     │   Library页面   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🚀 快速开始

### 第一步：在 We-MP-RSS 后台订阅公众号

1. **访问 We-MP-RSS 后台**
   ```
   http://81.70.105.204:8001
   ```

2. **登录后，搜索并添加「锦秋集」公众号**
   - 点击左侧"添加订阅"
   - 搜索"锦秋集"
   - 点击订阅按钮

3. **首次订阅会自动抓取历史文章**（默认 5 页，约 50 篇）

### 第二步：配置环境变量

在 `.env.local` 文件中添加以下配置：

```bash
# We-MP-RSS 服务地址
WEMPRSS_URL=http://81.70.105.204:8001

# We-MP-RSS 登录凭证（与后台登录相同）
WEMPRSS_USERNAME=your_username
WEMPRSS_PASSWORD=your_password

# Cron Job 密钥（可选，用于保护定时任务）
CRON_SECRET=your_random_secret_string
```

### 第三步：验证配置

```bash
# 启动开发服务器
npm run dev

# 测试 API - 查看已订阅的公众号
curl http://localhost:3000/api/wechat/sync

# 测试 API - 获取文章列表
curl http://localhost:3000/api/wechat/articles
```

---

## 📡 手动同步文章

### 方式一：通过 API 触发

```bash
# 查看已订阅的公众号
curl http://localhost:3000/api/wechat/sync

# 触发所有公众号同步（抓取最新 1 页）
curl -X POST http://localhost:3000/api/wechat/sync \
  -H "Content-Type: application/json" \
  -d '{"pages": 1}'

# 触发指定公众号同步（抓取最新 3 页）
curl -X POST http://localhost:3000/api/wechat/sync \
  -H "Content-Type: application/json" \
  -d '{"mpId": "MP_WXS_xxx", "pages": 3}'
```

### 方式二：在 We-MP-RSS 后台操作

1. 访问 http://81.70.105.204:8001
2. 找到「锦秋集」公众号
3. 点击"更新"按钮

---

## ⏰ 定时同步（Vercel Cron）

已配置 Vercel Cron Job，**每天早上 8 点自动同步最新文章**。

### 配置文件

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-wechat",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### 修改定时频率

| 频率 | Cron 表达式 |
|------|------------|
| 每天 8:00 | `0 8 * * *` |
| 每 6 小时 | `0 */6 * * *` |
| 每小时 | `0 * * * *` |
| 每天 8:00 和 20:00 | `0 8,20 * * *` |

### 手动触发 Cron

```bash
# 本地测试
curl http://localhost:3000/api/cron/sync-wechat

# 生产环境（需要 CRON_SECRET）
curl -H "Authorization: Bearer your_cron_secret" \
  https://your-domain.vercel.app/api/cron/sync-wechat
```

---

## 栏目与文章分类

微信公众号「锦秋集」的文章会根据关键词自动分类到对应栏目：

| 栏目 Slug | 栏目名称 | 匹配关键词 |
|-----------|----------|------------|
| `jinqiu-select` | Jinqiu Select（锦秋精选） | 精选、Select、报告、研究 |
| `jinqiu-scan` | Jinqiu Scan（锦秋扫描） | 扫描、Scan、测评、产品 |
| `jinqiu-spotlight` | Jinqiu Spotlight | Spotlight、聚光、创业者 |
| `jinqiu-roundtable` | 锦秋小饭桌 | 小饭桌、Roundtable、饭局 |
| `jinqiu-summit` | 锦秋会 | 锦秋会、Summit、峰会 |

## API 端点

### 获取文章列表

```
GET /api/wechat/articles
```

参数：
- `mp`: 公众号名称，默认 "锦秋集"
- `category`: 栏目 slug，如 "jinqiu-select"
- `search`: 自定义搜索词
- `limit`: 每页数量，默认 20
- `offset`: 偏移量，默认 0

示例：
```bash
# 获取锦秋精选的文章
curl "/api/wechat/articles?category=jinqiu-select&limit=10"

# 搜索包含 "AI" 的文章
curl "/api/wechat/articles?search=AI"
```

### 获取文章详情

```
GET /api/wechat/articles/[id]
```

### 获取公众号列表

```
GET /api/wechat/articles?action=feeds
```

## We-MP-RSS 服务管理

### 订阅公众号

1. 访问 We-MP-RSS 管理界面：http://81.70.105.204:8001
2. 登录后，搜索并添加「锦秋集」公众号
3. 等待文章同步完成

### 手动触发同步

```bash
# 更新指定公众号的文章
GET http://81.70.105.204:8001/mps/update/{mp_id}
```

## 文件结构

```
jinqiucapital/
├── lib/
│   └── wemprss.ts          # We-MP-RSS 客户端库
├── app/
│   ├── api/
│   │   └── wechat/
│   │       └── articles/
│   │           ├── route.ts       # 文章列表 API
│   │           └── [id]/
│   │               └── route.ts   # 文章详情 API
│   └── library/
│       └── [slug]/
│           └── page.tsx    # Library 页面（已集成微信文章）
```

## 注意事项

1. **Token 有效期**：We-MP-RSS 的 JWT Token 有效期为 3 天，客户端会自动刷新。

2. **文章筛选**：目前使用关键词匹配来分类文章，如果文章标题或内容中不包含对应关键词，可能无法正确分类。

3. **缓存策略**：建议在生产环境中添加缓存层，避免频繁请求 We-MP-RSS 服务。

4. **错误处理**：如果 We-MP-RSS 服务不可用，页面会优雅降级，只显示静态配置的文章。

## 扩展

### 添加新栏目

在 `app/api/wechat/articles/route.ts` 中的 `CATEGORY_KEYWORDS` 添加新的映射：

```typescript
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // ... 现有栏目
  "new-category": ["关键词1", "关键词2"],
};
```

### 自定义公众号

如需接入其他公众号，只需：

1. 在 We-MP-RSS 中订阅该公众号
2. 调用 API 时传入 `mp` 参数

```bash
curl "/api/wechat/articles?mp=其他公众号名称"
```

