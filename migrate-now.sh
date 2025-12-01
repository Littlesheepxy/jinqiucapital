#!/bin/bash
# 快速迁移脚本

echo "🔄 开始迁移数据到 Supabase..."
echo ""

# 加载环境变量
export $(cat .env.local | grep -v '^#' | xargs)

# 执行迁移
pnpm tsx scripts/migrate-to-supabase.ts

echo ""
echo "✅ 迁移完成！"
echo ""
echo "下一步："
echo "1. 重启开发服务器: npm run dev"
echo "2. 访问管理后台: http://localhost:3000/admin"
echo "3. 测试数据读写"

