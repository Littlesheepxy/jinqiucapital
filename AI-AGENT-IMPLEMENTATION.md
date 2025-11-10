# 锦秋基金 AI Agent 风格改造 - 实施文档

## 概述

本项目将锦秋基金网站改造为 AI Agent 风格，通过终端风格界面、命令行交互和动态效果，打造独特的用户体验。

## 已实现的 7 个模块

### ✅ 模块 1: Hero Agent - 开机场景
**文件:** `components/hero-agent.tsx`

**特性:**
- 终端启动动画 `[system] Booting Jinqiu Agent...`
- 自定义打字机效果逐字输出
- 光标闪烁动画
- 关键词高亮显示（锦秋基金、人工智能等）
- 提示符 `>` 使用主色 #225BBA
- CTA 按钮淡入效果

### ✅ 模块 2: About Agent - 自我介绍
**文件:** `components/about-agent.tsx`

**特性:**
- CLI 风格问答布局（who/what/how）
- 滚动触发逐行出现动画
- Hover 显示锚点链接提示
- 关键数据卡片（12年、$1B+、30+）
- 数字滚动动画
- 问题用 `>` 前缀，答案用 `→` 前缀

### ✅ 模块 3: Team Agent - AI 档案馆
**文件:** `components/team-agent.tsx`

**特性:**
- 响应式网格卡片布局（2-4列）
- 渐变背景头像占位符
- Hover 蓝色 outline 闪动效果
- 命令式描述：`> profile.load("张三")`
- 显示投资方向和过往项目
- 支持 LinkedIn/X 外链

### ✅ 模块 4: Portfolio Query - 查询系统
**文件:** `components/portfolio-query.tsx`

**特性:**
- 查询式 UI：`portfolio.filter(category="具身智能")`
- 方向筛选按钮（AI应用/芯片/具身智能）
- 查询完成提示：`> query complete.`
- 公司卡片带标签和描述
- Hover 显示投资时间注释
- 列表切换 stagger 动画

### ✅ 模块 5: Projects Modules - 模块清单
**文件:** `components/projects-modules.tsx`

**特性:**
- 模块列表：`> modules.list()`
- 点击展开详情：`> module.open("Soil")`
- 手风琴展开/收起动画
- 显示状态、案例、品牌色
- 双语标题（中英文）
- Emoji 品牌图标

### ✅ 模块 6: Library System - 知识库
**文件:** `components/library-system.tsx`

**特性:**
- 访问界面：`> access: /library`
- 搜索栏支持全文检索
- 标签筛选功能
- Hover 显示文件路径
- 文件图标 📄
- 更新时间显示

### ✅ 模块 7: Agent Interface - For Agents 彩蛋
**文件:** `components/agent-interface.tsx`

**特性:**
- 右下角悬浮按钮
- 两种模式切换：
  - **命令行交互**: 预设问答，打字机回复
  - **JSON 模式**: 结构化数据展示，一键复制
- Radix Dialog 弹窗
- 终端风格样式
- 预留 API 接口注释

## 技术栈

### 核心框架
- **Next.js 16.0.0** - React 框架
- **React 19.2.0** - UI 库
- **TypeScript 5** - 类型系统

### 动画库
- **Framer Motion 11.11.17** - 动画和交互效果
- **react-type-animation 3.2.0** - 打字机效果（已弃用自定义实现）

### UI 组件
- **Radix UI** - 无样式组件库（Dialog、Accordion等）
- **Tailwind CSS 4** - 原子化 CSS
- **Lucide React** - 图标库

## 设计规范

### 颜色系统
- **主色**: `#225BBA` - 用于提示符、关键词、按钮
- **终端背景**: `#FAFAFA` (浅色) / `#1a1a1a` (深色)
- **文字**: 等宽字体 `font-mono`

### 动画时长
- 打字效果: 40ms/字符
- 进入动画: 0.3-0.5s
- Hover 效果: 0.2s
- 展开/收起: 0.4s

### 响应式设计
- 移动端优化所有交互
- 网格布局自适应（1/2/3/4列）
- 触摸设备友好

## 数据结构

### portfolio.json
```json
{
  "name": "公司名称",
  "category": "具身智能",
  "description": "简介",
  "investmentDate": "2024-Q4",
  "tags": ["标签1", "标签2"]
}
```

### projects.json
```json
{
  "name": "项目名",
  "nameEn": "English Name",
  "status": "活跃",
  "cases": ["案例1", "案例2"],
  "details": "详细说明"
}
```

### team.json
```json
{
  "name": "姓名",
  "title": "职位",
  "focus": "投资方向",
  "bio": "简介",
  "projects": ["项目1"]
}
```

### library.json
```json
{
  "name": "名称",
  "nameCn": "中文名",
  "tags": ["标签"],
  "path": "/路径",
  "date": "2025-01"
}
```

## 文件结构

```
/components
  ├── hero-agent.tsx          # 模块1: 开机场景
  ├── about-agent.tsx         # 模块2: 自我介绍
  ├── team-agent.tsx          # 模块3: 团队档案馆
  ├── portfolio-query.tsx     # 模块4: 投资组合查询
  ├── projects-modules.tsx    # 模块5: 项目矩阵
  ├── library-system.tsx      # 模块6: 知识库
  └── agent-interface.tsx     # 模块7: Agent 接口

/public/data
  ├── portfolio.json          # 投资组合数据
  ├── projects.json           # 项目数据
  ├── library.json            # 研究库数据
  └── team.json               # 团队数据

/app
  └── page.tsx                # 主页面（集成所有模块）
```

## 使用说明

### 安装依赖
```bash
pnpm install
# 如遇到网络问题，依赖已在 package.json 中声明
```

### 开发运行
```bash
pnpm dev
# 访问 http://localhost:3000
```

### 构建生产版本
```bash
pnpm build
pnpm start
```

## 特色功能

### 1. 打字机效果
所有文本输出都使用自定义打字机效果，模拟真实终端体验。

### 2. 命令式交互
使用 `>` 和 `→` 符号，营造命令行界面感觉。

### 3. 动态数据加载
所有数据从 JSON 文件动态加载，易于维护。

### 4. 深色模式支持
全站支持深色模式，根据系统主题自动切换。

### 5. 响应式设计
完美适配移动端、平板和桌面端。

## 性能优化

- ✅ 使用 Framer Motion 的 `useInView` 减少不必要的动画
- ✅ 图片使用占位符和渐变背景
- ✅ 代码分割和懒加载
- ✅ 避免不必要的重渲染

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 已知问题与改进建议

### 待优化项
1. **依赖安装**: 由于网络证书问题，需要手动安装依赖或配置镜像
2. **图片优化**: 可以添加真实的团队头像和公司 logo
3. **SEO优化**: 可以添加更多 meta 标签和结构化数据

### 未来扩展
1. **真实 AI 集成**: Agent Interface 已预留 API 接口
2. **多语言支持**: 可扩展国际化功能
3. **数据可视化**: 投资数据图表展示
4. **性能监控**: 添加 analytics 和性能追踪

## 维护指南

### 更新投资组合
编辑 `public/data/portfolio.json` 添加新公司。

### 添加项目
编辑 `public/data/projects.json` 添加新项目模块。

### 更新团队
编辑 `public/data/team.json` 添加或修改团队成员。

### 发布研究
编辑 `public/data/library.json` 添加新的研究内容。

## 致谢

本项目使用了以下开源项目：
- [Next.js](https://nextjs.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**版本**: 1.0.0  
**完成日期**: 2025-01  
**技术栈**: Next.js 16 + React 19 + Framer Motion + TypeScript

