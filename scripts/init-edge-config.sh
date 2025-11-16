#!/bin/bash

# Edge Config ID
EDGE_CONFIG_ID="ecfg_6uatwxciwifhmu68tirkqqhgsea8"

# 获取 Vercel Token (需要先设置)
if [ -z "$VERCEL_TOKEN" ]; then
  echo "请先设置 VERCEL_TOKEN 环境变量"
  echo "在 Vercel Dashboard: Settings → Tokens → Create Token"
  exit 1
fi

# 读取 content.json
CONTENT_DATA=$(cat public/data/content.json | jq -c .)

# 读取 team.json
TEAM_DATA=$(cat public/data/team.json | jq -c .)

# 添加 content 到 Edge Config
curl -X PATCH "https://api.vercel.com/v1/edge-config/$EDGE_CONFIG_ID/items" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "operation": "upsert",
        "key": "content",
        "value": '"$CONTENT_DATA"'
      }
    ]
  }'

echo "\n✓ Content data uploaded"

# 添加 team 到 Edge Config
curl -X PATCH "https://api.vercel.com/v1/edge-config/$EDGE_CONFIG_ID/items" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "operation": "upsert",
        "key": "team",
        "value": '"$TEAM_DATA"'
      }
    ]
  }'

echo "\n✓ Team data uploaded"
echo "\n🎉 Edge Config initialized successfully!"

