#!/bin/bash

# Supabase SQL 执行脚本
# 使用方法: ./scripts/run-sql.sh [sql文件路径]

# 从 .env.local 加载环境变量
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
SQL_FILE=${1:-scripts/init-supabase.sql}

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ 错误: NEXT_PUBLIC_SUPABASE_URL 未设置"
  echo "请检查 .env.local 文件"
  exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ 错误: SQL 文件不存在: $SQL_FILE"
  exit 1
fi

echo "🗄️  执行 SQL 文件: $SQL_FILE"
echo "🔗 Supabase URL: $SUPABASE_URL"
echo ""

# 提取主机和端口
HOST=$(echo $SUPABASE_URL | sed -e 's|^http://||' -e 's|^https://||' -e 's|:.*||')
PORT=$(echo $SUPABASE_URL | grep -o ':[0-9]*' | tr -d ':')

if [ -z "$PORT" ]; then
  PORT=5432
fi

echo "📍 连接信息:"
echo "   主机: $HOST"
echo "   端口: $PORT"
echo ""

# 检查 psql 是否安装
if ! command -v psql &> /dev/null; then
  echo "❌ 错误: psql 未安装"
  echo ""
  echo "请安装 PostgreSQL 客户端："
  echo "  macOS: brew install postgresql"
  echo "  Ubuntu: sudo apt-get install postgresql-client"
  echo ""
  echo "或者在 Supabase Dashboard 中手动执行 SQL："
  echo "  1. 访问 $SUPABASE_URL"
  echo "  2. 进入 SQL Editor"
  echo "  3. 复制并执行 $SQL_FILE 中的内容"
  exit 1
fi

echo "执行 SQL..."
psql -h "$HOST" -p "$PORT" -U postgres -d postgres -f "$SQL_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SQL 执行成功!"
  echo ""
  echo "下一步: 运行数据迁移"
  echo "  pnpm tsx scripts/migrate-to-supabase.ts"
else
  echo ""
  echo "❌ SQL 执行失败"
  echo ""
  echo "请尝试手动执行："
  echo "  1. 访问 Supabase Dashboard"
  echo "  2. 进入 SQL Editor"
  echo "  3. 复制并执行以下内容:"
  echo ""
  cat "$SQL_FILE"
fi

