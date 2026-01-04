/**
 * 定时同步微信公众号文章
 * 
 * Vercel Cron Job - 每天自动抓取最新文章
 * 配置在 vercel.json 中
 */

import { NextResponse } from "next/server";

const WEMPRSS_URL = process.env.WEMPRSS_URL || "http://81.70.105.204:8001";
const WEMPRSS_USERNAME = process.env.WEMPRSS_USERNAME || "";
const WEMPRSS_PASSWORD = process.env.WEMPRSS_PASSWORD || "";
const CRON_SECRET = process.env.CRON_SECRET || "";

// Token 缓存
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function login(): Promise<string> {
  const endpoints = ["/api/v1/wx/auth/login", "/api/v1/login"];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${WEMPRSS_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: WEMPRSS_USERNAME,
          password: WEMPRSS_PASSWORD,
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      if (data.detail || data.error) continue;
      
      const token = data.access_token || data.data?.access_token;
      if (token) return token;
    } catch {
      continue;
    }
  }
  throw new Error("无法登录 We-MP-RSS");
}

async function getValidToken(): Promise<string> {
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }
  cachedToken = await login();
  tokenExpiry = Date.now() + (3 * 24 - 1) * 60 * 60 * 1000;
  return cachedToken;
}

async function fetchWithAuth(endpoint: string): Promise<Response> {
  const token = await getValidToken();
  return fetch(`${WEMPRSS_URL}${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function GET(request: Request) {
  try {
    // 验证 Cron Secret（防止未授权调用）
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] 开始同步微信公众号文章...");

    // 获取所有公众号
    const feedsResponse = await fetchWithAuth("/mps?limit=100");
    const feedsData = await feedsResponse.json();
    const feeds = feedsData.data?.list || [];

    if (feeds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "没有找到已订阅的公众号",
      });
    }

    // 触发每个公众号更新（只抓取最新 1 页）
    const results = [];
    for (const feed of feeds) {
      try {
        const updateResponse = await fetchWithAuth(
          `/mps/update/${feed.id}?start_page=0&end_page=1`
        );
        const updateData = await updateResponse.json();
        
        results.push({
          id: feed.id,
          name: feed.mp_name,
          success: updateResponse.ok,
          articlesFound: updateData.data?.total || 0,
        });

        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        results.push({
          id: feed.id,
          name: feed.mp_name,
          success: false,
          error: err instanceof Error ? err.message : "失败",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[Cron] 同步完成: ${successCount}/${results.length} 成功`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
      },
    });
  } catch (error) {
    console.error("[Cron] 同步失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "同步失败",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

