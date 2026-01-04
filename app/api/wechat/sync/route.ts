/**
 * 微信公众号文章同步 API
 * 
 * 触发 We-MP-RSS 抓取最新文章
 */

import { NextResponse } from "next/server";

const WEMPRSS_URL = process.env.WEMPRSS_URL || "http://81.70.105.204:8001";
const WEMPRSS_USERNAME = process.env.WEMPRSS_USERNAME || "";
const WEMPRSS_PASSWORD = process.env.WEMPRSS_PASSWORD || "";

// Token 缓存
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * 登录获取 Token
 */
async function login(): Promise<string> {
  const endpoints = [
    "/api/v1/wx/auth/login",
    "/api/v1/login",
  ];

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

  throw new Error("无法登录 We-MP-RSS 服务");
}

async function getValidToken(): Promise<string> {
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }
  cachedToken = await login();
  tokenExpiry = Date.now() + (3 * 24 - 1) * 60 * 60 * 1000;
  return cachedToken;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getValidToken();
  return fetch(`${WEMPRSS_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

/**
 * GET: 获取公众号列表和状态
 */
export async function GET() {
  try {
    const response = await fetchWithAuth("/mps?limit=100");
    
    if (!response.ok) {
      throw new Error(`获取公众号列表失败: ${response.status}`);
    }

    const data = await response.json();
    const feeds = data.data?.list || [];

    return NextResponse.json({
      success: true,
      data: {
        feeds: feeds.map((feed: any) => ({
          id: feed.id,
          name: feed.mp_name,
          cover: feed.mp_cover,
          status: feed.status,
          createdAt: feed.created_at,
        })),
        total: feeds.length,
        wemprssUrl: WEMPRSS_URL,
      },
      message: `找到 ${feeds.length} 个已订阅的公众号`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "获取失败",
      wemprssUrl: WEMPRSS_URL,
    }, { status: 500 });
  }
}

/**
 * POST: 触发文章同步
 * 
 * Body:
 * - mpId: 公众号 ID（可选，不传则同步所有）
 * - pages: 抓取页数，默认 1
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { mpId, pages = 1 } = body;

    // 获取公众号列表
    const feedsResponse = await fetchWithAuth("/mps?limit=100");
    const feedsData = await feedsResponse.json();
    const feeds = feedsData.data?.list || [];

    if (feeds.length === 0) {
      return NextResponse.json({
        success: false,
        error: "没有找到已订阅的公众号，请先在 We-MP-RSS 后台订阅「锦秋集」",
        wemprssUrl: WEMPRSS_URL,
      }, { status: 404 });
    }

    // 筛选要同步的公众号
    const targetFeeds = mpId 
      ? feeds.filter((f: any) => f.id === mpId)
      : feeds;

    if (targetFeeds.length === 0) {
      return NextResponse.json({
        success: false,
        error: `未找到 ID 为 ${mpId} 的公众号`,
      }, { status: 404 });
    }

    // 触发每个公众号的文章更新
    const results = [];
    for (const feed of targetFeeds) {
      try {
        const updateResponse = await fetchWithAuth(
          `/mps/update/${feed.id}?start_page=0&end_page=${pages}`
        );
        const updateData = await updateResponse.json();
        
        results.push({
          id: feed.id,
          name: feed.mp_name,
          success: updateResponse.ok,
          message: updateData.data?.message || updateData.message || "已触发更新",
          articlesFound: updateData.data?.total || 0,
        });
      } catch (err) {
        results.push({
          id: feed.id,
          name: feed.mp_name,
          success: false,
          message: err instanceof Error ? err.message : "更新失败",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      data: {
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: results.length - successCount,
        },
      },
      message: `已触发 ${successCount}/${results.length} 个公众号的文章更新`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "同步失败",
    }, { status: 500 });
  }
}

