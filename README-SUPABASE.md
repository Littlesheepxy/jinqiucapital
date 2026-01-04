# 🚀 Supabase 集成完成指南

## ✅ 已完成的工作

1. ✅ 安装 Supabase 客户端库
2. ✅ 配置环境变量（`.env.local`）
3. ✅ 创建 Supabase 客户端（`lib/supabase.ts`）
4. ✅ 更新 API 路由使用 Supabase
5. ✅ 创建数据库初始化脚本
6. ✅ 创建数据迁移脚本
7. ✅ 创建版本历史 API

## 🔧 需要您完成的步骤

### 步骤 1️⃣: 在 Supabase 中创建数据库表

**选项 A：使用 Supabase Dashboard（推荐）**

1. 打开浏览器访问您的 Supabase Dashboard：
   ```
   http://8.161.114.214
   ```

2. 登录后，在左侧菜单找到 **SQL Editor**

3. 点击 **New Query**

4. 复制以下 SQL 并执行：

```sql
-- 创建内容表
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建团队表
CREATE TABLE IF NOT EXISTS team (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建版本历史表
CREATE TABLE IF NOT EXISTS version_history (
  id SERIAL PRIMARY KEY,
  data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('content', 'team')),
  data JSONB NOT NULL,
  version INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_content_version ON content(version DESC);
CREATE INDEX IF NOT EXISTS idx_team_version ON team(version DESC);
CREATE INDEX IF NOT EXISTS idx_version_history_type ON version_history(data_type, created_at DESC);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 content 表创建触发器
DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 team 表创建触发器
DROP TRIGGER IF EXISTS update_team_updated_at ON team;
CREATE TRIGGER update_team_updated_at
  BEFORE UPDATE ON team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入初始数据（如果表为空）
INSERT INTO content (data, version)
SELECT '{}'::jsonb, 1
WHERE NOT EXISTS (SELECT 1 FROM content);

INSERT INTO team (data, version)
SELECT '[]'::jsonb, 1
WHERE NOT EXISTS (SELECT 1 FROM team);

COMMENT ON TABLE content IS '网站内容数据表';
COMMENT ON TABLE team IS '团队成员数据表';
COMMENT ON TABLE version_history IS '版本历史记录表';
```

5. 点击 **Run** 执行

6. 验证表创建：在左侧菜单中找到 **Table Editor**，应该能看到 3 个新表：
   - `content`
   - `team`
   - `version_history`

**选项 B：使用命令行（如果安装了 psql）**

```bash
# 方法1：使用辅助脚本
./scripts/run-sql.sh

# 方法2：直接使用 psql
psql -h 8.161.114.214 -U postgres -d postgres -f scripts/init-supabase.sql
```

### 步骤 2️⃣: 迁移现有数据

表创建成功后，在终端执行：

```bash
export $(cat .env.local | grep -v '^#' | xargs)
pnpm tsx scripts/migrate-to-supabase.ts
```

您应该看到类似输出：

```
🚀 开始迁移数据到 Supabase...

📖 读取本地数据文件...
✓ Content 数据读取成功
  - Portfolio items: 3
  - Projects: 1
  - Research: 5
✓ Team 数据读取成功
  - 团队成员: 16

🔗 测试 Supabase 连接...
✓ Supabase 连接成功

📤 上传 Content 数据...
✓ Content 数据上传成功

📤 上传 Team 数据...
✓ Team 数据上传成功

📝 创建初始版本历史...
✓ 版本历史创建成功

🔍 验证迁移结果...
✓ Content 记录: 1
✓ Team 记录: 1

==================================================
✅ 数据迁移完成！
==================================================
```

### 步骤 3️⃣: 本地测试

```bash
# 启动开发服务器（如果还没启动）
npm run dev
```

然后访问：http://localhost:3000/admin

测试清单：
- ✅ 登录（密码：`Jinqiu@2025`）
- ✅ 查看数据是否正确加载
- ✅ 编辑任意内容
- ✅ 点击"手动保存"
- ✅ 应该显示 "Data saved to Supabase" 和版本号
- ✅ 刷新页面，确认修改已保存
- ✅ 关闭浏览器，重新打开管理后台，数据应该还在

### 步骤 4️⃣: Vercel 部署配置

1. 打开 Vercel Dashboard
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=http://8.161.114.214
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY0NTU3NzU4LCJleHAiOjEzMjc1MTk3NzU4fQ.CgGeBSur4gC9I1Sl7zgA7wdGSyI1EEDQuD4Xy769KUI
ADMIN_PASSWORD=Jinqiu@2025
```

5. 点击 **Save**
6. 触发重新部署（可以通过 Git push 或手动部署）

## 📊 数据结构说明

### content 表
存储网站所有内容数据（JSONB 格式）：
- 品牌设置
- 关于我们
- 投资组合
- 项目列表
- 研究活动

### team 表
存储团队成员列表（JSONB 数组）

### version_history 表
每次保存自动创建版本快照，支持：
- 版本对比
- 历史回滚
- 变更追踪

## 🎯 新功能

### 自动版本历史
- ✅ 每次保存自动创建版本记录
- ✅ 包含版本号和时间戳
- ✅ 支持添加版本描述

### 数据持久化
- ✅ 不再依赖 Edge Config（避免大小限制）
- ✅ 不再依赖文件系统（Vercel 上可靠）
- ✅ 使用成熟的 PostgreSQL 数据库

### 未来扩展
- 版本对比可视化
- 一键回滚到历史版本
- 多人协作编辑
- 实时同步（Supabase Realtime）

## ⚠️ 注意事项

1. **Supabase URL 必须可访问**
   - 确保 `http://8.161.114.214` 可以从本地和 Vercel 访问
   - 如果是内网地址，Vercel 部署时无法访问

2. **数据安全**
   - 当前使用 `anon` key，适合开发环境
   - 生产环境建议配置 RLS (Row Level Security)
   - 建议定期备份数据库

3. **版本历史清理**
   - 版本历史会不断增长
   - 建议定期清理旧版本（保留最近 N 个版本）

## 🔧 故障排查

### 问题：连接 Supabase 失败

**检查清单：**
```bash
# 1. 测试连接
curl http://8.161.114.214

# 2. 检查环境变量
export $(cat .env.local | grep -v '^#' | xargs)
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. 测试 Supabase 连接
pnpm tsx scripts/test-supabase.ts
```

### 问题：表不存在

说明：SQL 脚本未执行成功

**解决方法：**
1. 在 Supabase Dashboard 的 SQL Editor 中手动执行
2. 查看执行错误信息

### 问题：数据保存失败

**检查步骤：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 错误
3. 查看 Network 请求的响应

常见错误：
- `401 Unauthorized`: 密码错误
- `500 Internal Server Error`: 数据库连接失败
- `JSONB format error`: 数据格式错误

## 📞 需要帮助？

如果遇到任何问题，请检查：
1. Supabase 服务是否运行
2. 数据库表是否创建成功
3. 环境变量是否配置正确
4. 浏览器 Console 的错误信息

## 🎉 完成！

所有设置完成后，您将拥有：
- ✅ 可靠的数据持久化（PostgreSQL）
- ✅ 自动版本历史
- ✅ 无大小限制
- ✅ 生产级数据库
- ✅ 数据不再丢失！

享受新的管理后台吧！🚀



