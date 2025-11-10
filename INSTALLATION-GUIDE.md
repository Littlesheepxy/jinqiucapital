# 锦秋基金 AI Agent 网站 - 安装指南

## 依赖安装问题解决方案

### 问题描述
在安装依赖时遇到 pnpm store 位置不一致或模块缺失的问题。

### 解决方案

#### 方案 1: 完全重新安装 (推荐)

```bash
# 1. 删除现有依赖
rm -rf node_modules .next pnpm-lock.yaml

# 2. 重新安装
pnpm install

# 3. 如果还有问题,使用 force 选项
pnpm install --force

# 4. 启动开发服务器
pnpm dev
```

#### 方案 2: 使用 npm (备选)

```bash
# 1. 删除 pnpm 相关文件
rm -rf node_modules .next pnpm-lock.yaml

# 2. 使用 npm 安装
npm install

# 3. 启动
npm run dev
```

#### 方案 3: 使用 yarn (备选)

```bash
# 1. 删除现有依赖
rm -rf node_modules .next pnpm-lock.yaml

# 2. 使用 yarn 安装
yarn install

# 3. 启动
yarn dev
```

### 常见错误及解决

#### 错误 1: `Cannot find module '@swc/helpers'`
**解决:** 已在 `package.json` 中添加该依赖,重新安装即可。

#### 错误 2: `Cannot find module 'next/dist/bin/next'`
**解决:** 
```bash
rm -rf node_modules
pnpm install --force
```

#### 错误 3: pnpm store 位置不一致
**解决:**
```bash
# 选项1: 使用全局 store
pnpm config set store-dir ~/.pnpm-store --global

# 选项2: 使用本地 store
rm -rf node_modules
pnpm install
```

### 验证安装

```bash
# 检查 Next.js 是否正确安装
ls node_modules/.bin/next

# 如果文件存在,尝试启动
pnpm dev
```

### 推荐的安装流程

```bash
# Step 1: 清理
rm -rf node_modules .next .pnpm-store pnpm-lock.yaml

# Step 2: 重新安装 (选择其一)
pnpm install   # 推荐
# 或
npm install    # 备选
# 或
yarn install   # 备选

# Step 3: 启动开发服务器
pnpm dev       # 如果用 pnpm
# 或
npm run dev    # 如果用 npm
# 或
yarn dev       # 如果用 yarn
```

### 环境要求

- **Node.js**: v18.17+ 或 v20.0+ (当前使用 v24.10.0 ✅)
- **包管理器**: pnpm 8+, npm 9+, 或 yarn 1.22+
- **操作系统**: macOS, Linux, Windows (WSL)

### 成功标志

当你看到以下输出时,表示启动成功:

```
> my-v0-project@0.1.0 dev
> next dev

  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.5s
```

### 如果所有方法都失败

最后的解决方案:

```bash
# 1. 完全清理
rm -rf node_modules .next .pnpm-store pnpm-lock.yaml package-lock.json yarn.lock

# 2. 降级 Next.js 版本 (修改 package.json)
# 将 "next": "16.0.0" 改为 "next": "15.1.0"

# 3. 重新安装
pnpm install

# 4. 启动
pnpm dev
```

## 已知问题

1. **React 19 + vaul 兼容性警告**: vaul 包显示 peer dependency 警告,但不影响使用,可以忽略。

2. **Sharp 构建脚本**: 显示 "Ignored build scripts: sharp",不影响开发,可以运行 `pnpm approve-builds` 来允许。

## 获取帮助

如果仍然遇到问题:

1. 检查 Node.js 版本: `node -v`
2. 检查包管理器版本: `pnpm -v` 或 `npm -v`
3. 查看详细错误日志
4. 尝试使用不同的包管理器

## 快速开始(假设依赖已安装)

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行 lint
pnpm lint
```

访问 http://localhost:3000 查看效果!

