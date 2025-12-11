# 🔄 主页同步测试指南

## 问题已解决！✅

### 根本原因
- ❌ 主页调用 `/api/content` 读取数据
- ❌ `/api/content` 之前从 Edge Config/文件系统读取
- ❌ 管理后台保存到 Supabase
- ❌ 导致主页显示旧数据

### 解决方案
- ✅ `/api/content` 现在优先从 Supabase 读取
- ✅ 管理后台保存后调用 `loadData()` 刷新
- ✅ 两个 API 都使用相同的数据源

## 🧪 本地测试步骤

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 测试管理后台保存

```bash
# 打开管理后台
open http://localhost:3000/admin

# 登录（密码：Jinqiu@2025）
```

**修改内容：**
1. 修改"关于我们"中文内容
2. 或修改品牌名称
3. 或添加/修改投资组合
4. 点击"手动保存"

**预期结果：**
```
✓ 保存成功！版本: content v3, team v3
```

### 3. 测试主页同步

**方法 A：刷新页面**
```bash
# 刷新主页
open http://localhost:3000/
```

**方法 B：查看 API 响应**
```bash
# 查看 API 返回的数据
curl http://localhost:3000/api/content | jq '.content.about.intro.zh' | head -5
```

**预期结果：**
- ✅ 主页显示最新修改的内容
- ✅ API 返回 Supabase 中的最新数据

### 4. 验证数据源

查看服务器日志，应该看到：

```
📊 从 Supabase 读取公开数据...
✅ 从 Supabase 读取成功
```

而不是：

```
📁 从文件系统读取数据...
```

## 🚀 Vercel 部署测试

### 1. 确认环境变量

在 Vercel Dashboard 中确认：

```
NEXT_PUBLIC_SUPABASE_URL=https://mzkfjhzcvxxoyggjufbf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_PASSWORD=Jinqiu@2025
```

### 2. 部署并测试

```bash
# 推送到 GitHub（自动触发 Vercel 部署）
git push origin feature/admin-improvements

# 等待部署完成...
```

### 3. 在生产环境测试

1. **访问管理后台**
   ```
   https://jinqiucapital.vercel.app/admin
   ```

2. **修改内容并保存**
   - 应该看到："✓ 保存成功！版本: content vX, team vY"

3. **刷新主页**
   ```
   https://jinqiucapital.vercel.app/
   ```
   - ✅ 应该立即显示最新内容！

4. **查看 Vercel 日志**
   - 在 Vercel Dashboard → Deployments → Functions 中查看日志
   - 应该看到 "✅ 从 Supabase 读取成功"

## 📊 数据流图

### 之前（有问题）❌

```
管理后台
  ↓ 保存
Supabase 数据库 ✓
  
主页
  ↓ 读取
文件系统（旧数据）✗
```

### 现在（已修复）✅

```
管理后台
  ↓ 保存
Supabase 数据库 ✓
  ↓ 读取
主页 ✓
```

## 🔍 故障排查

### 问题：主页还是显示旧数据

**检查清单：**

1. **Vercel 环境变量是否配置？**
   ```bash
   # 在 Vercel Dashboard 查看
   Settings → Environment Variables
   ```

2. **Supabase 数据是否保存成功？**
   ```bash
   # 本地运行检查脚本
   export $(cat .env.local | grep -v '^#' | xargs)
   pnpm tsx scripts/check-db.ts
   ```

3. **API 是否从 Supabase 读取？**
   - 查看 Vercel Function Logs
   - 应该看到 "✅ 从 Supabase 读取成功"
   - 如果看到 "📁 从文件系统读取"，说明 Supabase 配置有问题

4. **浏览器缓存？**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   强制刷新
   ```

### 问题：保存失败

**可能原因：**

1. **Supabase 连接失败**
   ```bash
   # 测试连接
   export $(cat .env.local | grep -v '^#' | xargs)
   pnpm tsx scripts/test-supabase.ts
   ```

2. **密码错误**
   - 确认密码是 `Jinqiu@2025`

3. **网络问题**
   - 检查是否能访问 `https://mzkfjhzcvxxoyggjufbf.supabase.co`

## ✅ 成功标志

当以下都成立时，说明一切正常：

- ✅ 管理后台保存显示："✓ 保存成功！版本: content vX, team vY"
- ✅ 主页刷新后立即显示最新内容
- ✅ Vercel 日志显示："✅ 从 Supabase 读取成功"
- ✅ 版本历史显示详细更改记录

## 🎉 测试完成

恭喜！数据现在完全同步了：

1. ✅ 管理后台 → Supabase
2. ✅ 主页 → Supabase
3. ✅ 版本历史 → Supabase
4. ✅ 实时同步！


