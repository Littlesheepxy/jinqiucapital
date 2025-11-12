# Vercel 生产环境配置指南（优化版）

> 基于 Vercel Edge Config 最新最佳实践

## 📋 前置准备

- Vercel 账号
- 项目已连接到 Vercel
- 本地已安装 `jq`（用于处理 JSON）：`brew install jq` (macOS)

---

## 🚀 快速配置流程

### 第1步：创建 Edge Config

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击顶部 **Storage** 标签
4. 点击 **Create Database** → 选择 **Edge Config**
5. 输入名称：`jinqiu-content`
6. 点击 **Create**
7. **保存 Edge Config ID**（格式：`ecfg_xxxxx`）

---

### 第2步：创建 Vercel API Token

1. 访问 [Vercel Tokens 页面](https://vercel.com/account/tokens)
2. 点击 **Create Token**
3. 输入名称：`jinqiu-edge-config-manager`
4. **Scope** 选择：
   - ✅ Full Account
   - （或选择特定项目权限）
5. **Expiration** 选择：No Expiration（或自定义）
6. 点击 **Create**
7. **立即复制并保存 Token**（只显示一次！）

---

### 第3步：初始化 Edge Config 数据

#### 方式 A：使用一键脚本（推荐 ⭐️）

```bash
# 在项目根目录运行
cd /Users/littleyang/Desktop/jinqiucapital

# 创建初始化脚本
cat > init-edge-config.sh << 'SCRIPT_END'
#!/bin/bash
set -e

echo "🚀 初始化 Edge Config..."

# 提示用户输入必要信息
read -p "请输入 Edge Config ID (ecfg_xxxxx): " EDGE_CONFIG_ID
read -sp "请输入 Vercel API Token: " VERCEL_TOKEN
echo ""

# 验证输入
if [ -z "$EDGE_CONFIG_ID" ] || [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ 错误：ID 或 Token 不能为空"
    exit 1
fi

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo "❌ 错误：未安装 jq。请运行: brew install jq"
    exit 1
fi

# 读取并格式化 JSON 文件
echo "📖 读取本地数据文件..."
CONTENT=$(cat public/data/content.json | jq -c '.')
TEAM=$(cat public/data/team.json | jq -c '.')

# 构建请求体
REQUEST_BODY=$(jq -n \
  --argjson content "$CONTENT" \
  --argjson team "$TEAM" \
  '{
    items: [
      {operation: "upsert", key: "content", value: $content},
      {operation: "upsert", key: "team", value: $team}
    ]
  }')

# 发送 API 请求
echo "📤 上传数据到 Edge Config..."
RESPONSE=$(curl -s -X PATCH \
  "https://api.vercel.com/v1/edge-config/$EDGE_CONFIG_ID/items" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

# 检查响应
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "❌ 错误："
    echo "$RESPONSE" | jq '.error'
    exit 1
else
    echo "✅ Edge Config 初始化成功！"
    echo "$RESPONSE" | jq '.'
fi
SCRIPT_END

# 赋予执行权限
chmod +x init-edge-config.sh

# 运行脚本
./init-edge-config.sh

# 完成后删除脚本（包含敏感信息）
rm init-edge-config.sh
```

#### 方式 B：使用 Node.js 脚本

```bash
# 创建 Node.js 脚本
cat > init-edge-config.mjs << 'SCRIPT_END'
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function init() {
  console.log('🚀 初始化 Edge Config...\n');

  const EDGE_CONFIG_ID = await question('请输入 Edge Config ID (ecfg_xxxxx): ');
  const VERCEL_TOKEN = await question('请输入 Vercel API Token: ');

  if (!EDGE_CONFIG_ID || !VERCEL_TOKEN) {
    console.error('❌ 错误：ID 或 Token 不能为空');
    process.exit(1);
  }

  console.log('\n📖 读取本地数据文件...');
  const content = JSON.parse(fs.readFileSync('./public/data/content.json', 'utf-8'));
  const team = JSON.parse(fs.readFileSync('./public/data/team.json', 'utf-8'));

  console.log('📤 上传数据到 Edge Config...');
  const response = await fetch(
    `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          { operation: 'upsert', key: 'content', value: content },
          { operation: 'upsert', key: 'team', value: team },
        ],
      }),
    }
  );

  const result = await response.json();

  if (result.error) {
    console.error('❌ 错误:', result.error);
    process.exit(1);
  }

  console.log('✅ Edge Config 初始化成功！');
  console.log(JSON.stringify(result, null, 2));
  rl.close();
}

init();
SCRIPT_END

# 运行
node init-edge-config.mjs

# 删除
rm init-edge-config.mjs
```

---

### 第4步：配置 Vercel 环境变量

1. 在 Vercel Dashboard，进入项目 → **Settings** → **Environment Variables**
2. 添加以下 3 个环境变量（适用于 **Production**）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ADMIN_PASSWORD` | `your_secure_password` | 管理后台密码（请改成强密码！） |
| `EDGE_CONFIG_ID` | `ecfg_xxxxx` | 你的 Edge Config ID |
| `VERCEL_API_TOKEN` | `your_vercel_token` | 刚才创建的 API Token |

> ⚠️ **注意**：`EDGE_CONFIG` 环境变量会在关联 Edge Config 后**自动添加**，无需手动设置！

---

### 第5步：重新部署

```bash
# 方式1：通过 Vercel CLI
vercel --prod

# 方式2：通过 Git Push
git add .
git commit -m "Configure Edge Config"
git push origin v3

# 方式3：在 Vercel Dashboard 手动重新部署
# 进入项目 → Deployments → 最新部署 → 点 "Redeploy"
```

---

## 🧪 验证配置

### 1. 检查环境变量

在 Vercel Dashboard → Settings → Environment Variables，确认：

- ✅ `ADMIN_PASSWORD` 已设置
- ✅ `EDGE_CONFIG` 存在（自动生成）
- ✅ `EDGE_CONFIG_ID` 已设置
- ✅ `VERCEL_API_TOKEN` 已设置

### 2. 检查 Edge Config 数据

1. 进入 Storage → 你的 Edge Config
2. 点击 **Items** 标签
3. 确认存在：
   - ✅ `content` 键（包含完整的内容数据）
   - ✅ `team` 键（包含团队成员数据）

### 3. 测试生产环境

```bash
# 访问你的生产网站
open https://jinqiucapital.com

# 访问管理后台
open https://jinqiucapital.com/admin

# 使用设置的密码登录，尝试修改内容并保存
```

---

## 🔍 故障排查

### 问题1：401 错误（未授权）

**原因**：密码验证失败

**解决方案**：
1. 检查 `ADMIN_PASSWORD` 环境变量是否设置正确
2. 重新部署项目
3. 清除浏览器缓存后重试

### 问题2：500 错误（服务器错误）

**原因**：Edge Config 配置不完整

**解决方案**：
1. 确认 `EDGE_CONFIG_ID` 和 `VERCEL_API_TOKEN` 已设置
2. 确认 Edge Config 已初始化数据（见第3步）
3. 检查 Vercel 部署日志：
   ```bash
   vercel logs https://jinqiucapital.com
   ```
4. 查找错误信息，特别是包含 "Edge Config" 的日志

### 问题3：保存后数据未更新

**原因**：Edge Config 传播延迟或更新失败

**解决方案**：
1. 等待 1-2 秒后刷新页面（Edge Config 有轻微传播延迟）
2. 检查浏览器控制台是否有错误
3. 查看 Vercel 函数日志：
   ```bash
   vercel logs --follow
   ```

### 问题4：本地开发无法保存

**原因**：本地环境未配置 Edge Config（正常现象）

**解决方案**：
本地开发会自动降级到 JSON 文件存储，这是预期行为：
```bash
# 本地开发时，数据保存在这里：
public/data/content.json
public/data/team.json
```

---

## 📊 架构说明

### 数据存储策略

```
┌─────────────────────────────────────────────┐
│              API 路由逻辑                    │
├─────────────────────────────────────────────┤
│                                             │
│  生产环境（Vercel）:                         │
│    ✓ 读取：Edge Config (超快)               │
│    ✓ 写入：通过 Vercel API 更新 Edge Config │
│    ✗ 文件系统：只读                          │
│                                             │
│  本地开发：                                  │
│    ✓ 读取：public/data/*.json               │
│    ✓ 写入：public/data/*.json               │
│    ✗ Edge Config：未配置（降级）             │
│                                             │
└─────────────────────────────────────────────┘
```

### 降级机制

代码实现了三层降级：

1. **优先**：从 Edge Config 读取（生产环境）
2. **降级1**：Edge Config 失败 → 从 JSON 文件读取
3. **降级2**：写入失败 → 记录错误但不中断

---

## 🎯 最佳实践

1. **定期备份**：Edge Config 数据应该定期导出备份
   ```bash
   # 导出当前数据
   curl "https://api.vercel.com/v1/edge-config/$EDGE_CONFIG_ID/items" \
     -H "Authorization: Bearer $VERCEL_TOKEN" \
     > backup-$(date +%Y%m%d).json
   ```

2. **密码安全**：使用强密码，并定期更换
   ```bash
   # 更新密码
   vercel env rm ADMIN_PASSWORD production
   vercel env add ADMIN_PASSWORD production
   # 输入新密码
   vercel --prod  # 重新部署
   ```

3. **监控日志**：使用 Vercel CLI 实时查看日志
   ```bash
   vercel logs --follow
   ```

4. **版本控制**：JSON 文件保留在 Git 中作为备份和本地开发使用

---

## 📚 参考文档

- [Vercel Edge Config 官方文档](https://vercel.com/docs/storage/edge-config)
- [Vercel Management API](https://vercel.com/docs/rest-api/endpoints/edge-config)
- [Context7 - Vercel Storage 文档](https://context7.com/vercel/storage)

---

## ✅ 配置检查清单

- [ ] Edge Config 已创建
- [ ] Edge Config 数据已初始化（`content` 和 `team`）
- [ ] Vercel API Token 已创建
- [ ] 环境变量已配置（`ADMIN_PASSWORD`, `EDGE_CONFIG_ID`, `VERCEL_API_TOKEN`）
- [ ] 项目已重新部署
- [ ] 生产环境可以正常访问
- [ ] 管理后台可以登录
- [ ] 管理后台可以保存数据
- [ ] 保存后前端显示更新

完成所有步骤后，你的网站就可以在生产环境中使用 Edge Config 进行内容管理了！🎉

