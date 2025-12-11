# Supabase 配置指南

## 📋 准备工作

已完成：
- ✅ 安装 `@supabase/supabase-js`
- ✅ 配置环境变量（`.env.local`）
- ✅ 创建 Supabase 客户端（`lib/supabase.ts`）
- ✅ 更新 API 路由使用 Supabase

## 🗄️ 步骤1: 创建数据库表

### 方法1: 使用 Supabase Dashboard（推荐）

1. 访问您的 Supabase Dashboard：http://8.161.114.214
2. 进入 **SQL Editor**
3. 复制并执行 `scripts/init-supabase.sql` 中的 SQL 语句

### 方法2: 使用 psql 命令行

```bash
# 连接到数据库
psql -h 8.161.114.214 -U postgres -d postgres

# 执行 SQL 文件
\i scripts/init-supabase.sql
```

### 验证表创建

执行以下查询确认表已创建：

```sql
-- 查看所有表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看表结构
\d content
\d team
\d version_history
```

## 📤 步骤2: 迁移数据

表创建成功后，运行迁移脚本：

```bash
# 加载环境变量并执行迁移
export $(cat .env.local | grep -v '^#' | xargs)
pnpm tsx scripts/migrate-to-supabase.ts
```

迁移脚本会：
1. 读取 `public/data/content.json` 和 `public/data/team.json`
2. 上传到 Supabase 数据库
3. 创建初始版本历史
4. 验证数据完整性

## 🧪 步骤3: 测试

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问管理后台
open http://localhost:3000/admin
```

测试功能：
1. ✅ 登录（密码：`Jinqiu@2025`）
2. ✅ 查看数据是否正确加载
3. ✅ 编辑内容
4. ✅ 保存（应该显示 "Data saved to Supabase"）
5. ✅ 刷新页面或重新登录，确认数据持久化

### 测试版本历史

```bash
# 查看版本历史
curl http://localhost:3000/api/admin/versions?type=content
```

## 🚀 步骤4: Vercel 部署

在 Vercel Dashboard 中添加环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=http://8.161.114.214
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY0NTU3NzU4LCJleHAiOjEzMjc1MTk3NzU4fQ.CgGeBSur4gC9I1Sl7zgA7wdGSyI1EEDQuD4Xy769KUI
ADMIN_PASSWORD=Jinqiu@2025
```

然后重新部署应用。

## 📊 数据库表结构

### content 表
- `id`: 主键
- `data`: JSONB，存储完整的 content 数据
- `version`: 版本号
- `created_at`: 创建时间
- `updated_at`: 更新时间

### team 表
- `id`: 主键
- `data`: JSONB 数组，存储团队成员数据
- `version`: 版本号
- `created_at`: 创建时间
- `updated_at`: 更新时间

### version_history 表
- `id`: 主键
- `data_type`: 'content' 或 'team'
- `data`: JSONB，历史数据快照
- `version`: 版本号
- `description`: 版本描述
- `created_at`: 创建时间

## 🎯 优势

相比 Edge Config，Supabase 方案：

✅ **无大小限制** - 可存储任意大小的内容
✅ **自动版本历史** - 每次保存自动创建版本记录
✅ **关系型数据库** - 支持复杂查询和事务
✅ **实时订阅** - 可实现多人协作（未来功能）
✅ **自托管** - 数据完全可控
✅ **免费** - 自部署的 Supabase 完全免费

## 🔧 故障排查

### 连接失败
- 检查 Supabase URL 是否正确（`http://8.161.114.214`）
- 检查防火墙是否允许访问
- 检查 Supabase 服务是否运行

### 表不存在
- 确认已执行 `init-supabase.sql`
- 在 Supabase Dashboard 中查看表列表

### 权限错误
- 检查 `ANON_KEY` 是否正确
- 确认表的 RLS (Row Level Security) 策略

### 数据未保存
- 查看浏览器 Console 错误
- 查看服务器日志 (`npm run dev` 的输出)
- 确认密码正确

## 📝 后续优化

1. **RLS 策略** - 为表添加行级别安全策略
2. **多用户支持** - 实现用户认证和权限管理
3. **实时协作** - 使用 Supabase Realtime 实现多人编辑
4. **自动备份** - 定期备份数据到文件系统或其他存储
5. **版本对比** - 可视化显示版本差异
6. **版本回滚** - 一键恢复到历史版本


