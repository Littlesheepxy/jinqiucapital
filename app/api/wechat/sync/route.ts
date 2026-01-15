/**
 * 微信公众号文章同步 API
 * 
 * 从 We-MP-RSS 抓取文章并保存到 PostgreSQL 数据库
 */

import { NextResponse } from "next/server";
import { query, queryOne, checkConnection } from "@/lib/db";
import {
  getArticlesByMpName,
  type WeMpRssArticle,
} from "@/lib/wemprss";
import { CATEGORIES, categorizeArticle, extractDescription, formatDate } from "@/lib/wechat-categories";

const WEMPRSS_URL = process.env.WEMPRSS_URL || "http://81.70.105.204:8001";
const WEMPRSS_USERNAME = process.env.WEMPRSS_USERNAME || "";
const WEMPRSS_PASSWORD = process.env.WEMPRSS_PASSWORD || "";

// Token 缓存
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// 默认获取的公众号名称
const DEFAULT_MP_NAME = "锦秋集";

// 检查数据库配置
function checkDbConfig(): boolean {
  return !!(process.env.DB_HOST || process.env.DB_NAME)
}

/**
 * 登录并获取 Token（支持传入凭据）
 */
async function loginWithCredentials(username: string, password: string): Promise<string | null> {
  if (!username || !password) {
    return null;
  }
  
  // We-MP-RSS 使用表单格式登录
  const endpoint = "/api/v1/wx/auth/login";
  
  try {
    console.log(`尝试登录 We-MP-RSS: ${WEMPRSS_URL}${endpoint}`);
    const response = await fetch(`${WEMPRSS_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    });

    const data = await response.json();
    console.log("登录响应:", JSON.stringify(data).substring(0, 300));
    
    // 检查错误
    if (data.detail?.code || data.detail?.message) {
      console.log(`登录失败: ${data.detail.message}`);
      return null;
    }
    
    const token = data.access_token || data.data?.access_token || data.token;
    if (token) {
      console.log("登录成功，获取到 Token");
      return token;
    }
    
    return null;
  } catch (err) {
    console.log(`登录异常: ${err}`);
    return null;
  }
}

/**
 * GET: 获取同步状态
 */
export async function GET() {
  try {
    let dbStats = null;
    
    if (checkDbConfig()) {
      const connected = await checkConnection();
      if (connected) {
        // 获取数据库统计
        const totalResult = await query<{ count: string }>(
          "SELECT COUNT(*) as count FROM wechat_articles"
        );
        const totalCount = parseInt(totalResult[0]?.count || "0");

        // 获取各分类数量
        const categoryStats: Record<string, number> = {};
        for (const slug of Object.keys(CATEGORIES)) {
          const catResult = await query<{ count: string }>(
            "SELECT COUNT(*) as count FROM wechat_articles WHERE category = $1",
            [slug]
          );
          categoryStats[slug] = parseInt(catResult[0]?.count || "0");
        }

        // 获取最新和最早文章时间
        const latest = await queryOne<{ publish_date: string; updated_at: string }>(
          "SELECT publish_date, updated_at FROM wechat_articles ORDER BY publish_time DESC LIMIT 1"
        );

        const oldest = await queryOne<{ publish_date: string }>(
          "SELECT publish_date FROM wechat_articles ORDER BY publish_time ASC LIMIT 1"
        );

        dbStats = {
          totalArticles: totalCount,
          categoryStats,
          latestArticle: latest?.publish_date,
          oldestArticle: oldest?.publish_date,
          lastSyncTime: latest?.updated_at,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        databaseConfigured: checkDbConfig(),
        wemprssUrl: WEMPRSS_URL,
        targetMpName: DEFAULT_MP_NAME,
        database: dbStats,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "获取状态失败",
    }, { status: 500 });
  }
}

/**
 * POST: 触发文章同步
 * 
 * Body:
 * - limit: 抓取文章数量，默认 200
 * - forceUpdate: 强制更新已存在的文章
 * - fetchMore: 触发 We-MP-RSS 抓取更多历史文章
 * - pages: 抓取页数，默认 10（约100篇文章）
 * - username: We-MP-RSS 用户名（可选，覆盖环境变量）
 * - password: We-MP-RSS 密码（可选，覆盖环境变量）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { limit = 200, forceUpdate = false, fetchMore = false, pages = 10, username, password } = body;
    
    // 允许通过请求体传入凭据
    const wemprssUsername = username || WEMPRSS_USERNAME;
    const wemprssPassword = password || WEMPRSS_PASSWORD;

    if (!checkDbConfig()) {
      return NextResponse.json({
        success: false,
        error: "数据库未配置，无法保存文章",
        suggestion: "请配置 DB_HOST, DB_NAME, DB_USER, DB_PASSWORD 环境变量",
      }, { status: 500 });
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: "数据库连接失败",
      }, { status: 500 });
    }

    // 如果需要抓取更多历史文章
    let fetchMoreResult = null;
    if (fetchMore) {
      console.log(`触发 We-MP-RSS 抓取更多历史文章，页数: ${pages}`);
      fetchMoreResult = await triggerFetchMore(pages, wemprssUsername, wemprssPassword);
      
      if (!fetchMoreResult.success) {
        return NextResponse.json({
          success: false,
          error: fetchMoreResult.error,
          suggestion: "请在请求中传入 username 和 password，或配置环境变量",
        }, { status: 500 });
      }
      
      // 等待 We-MP-RSS 抓取完成
      console.log("等待 We-MP-RSS 抓取完成...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // 从 We-MP-RSS 获取文章
    console.log(`开始从 We-MP-RSS 获取文章，限制: ${limit}`);
    const result = await getArticlesByMpName(DEFAULT_MP_NAME, limit, 0);

    if (!result.feed) {
      return NextResponse.json({
        success: false,
        error: `未找到公众号: ${DEFAULT_MP_NAME}`,
        suggestion: "请先在 We-MP-RSS 中订阅「锦秋集」公众号",
        wemprssUrl: WEMPRSS_URL,
      }, { status: 404 });
    }

    const articles = result.articles;
    console.log(`从 We-MP-RSS 获取到 ${articles.length} 篇文章`);

    // 获取已存在的文章 ID（用于检查是否需要更新）
    let existingIds: Set<string> = new Set();
    if (!forceUpdate) {
      const existing = await query<{ id: string }>("SELECT id FROM wechat_articles");
      existingIds = new Set(existing?.map(row => row.id) || []);
    }

    // 准备要保存的文章
    const rows = articles.map((article: WeMpRssArticle) => ({
      id: article.id,
      title: article.title,
      description: article.description || extractDescription(article.content),
      content: article.content,
      url: article.url,
      cover_image: article.pic_url,
      publish_time: article.publish_time,
      publish_date: formatDate(article.publish_time),
      mp_name: article.mp_name || result.feed?.mp_name,
      category: categorizeArticle(article),
    }));

    // 过滤出新文章（如果不是强制更新）
    const newRows = forceUpdate 
      ? rows 
      : rows.filter(row => !existingIds.has(row.id));

    // 统计分类
    const categoryStats: Record<string, number> = {};
    rows.forEach(row => {
      const cat = row.category || "uncategorized";
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // 保存到数据库
    if (newRows.length > 0) {
      for (const row of newRows) {
        await query(
          `INSERT INTO wechat_articles (id, title, description, content, url, cover_image, publish_time, publish_date, mp_name, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             content = EXCLUDED.content,
             url = EXCLUDED.url,
             cover_image = EXCLUDED.cover_image,
             publish_time = EXCLUDED.publish_time,
             publish_date = EXCLUDED.publish_date,
             mp_name = EXCLUDED.mp_name,
             category = EXCLUDED.category,
             updated_at = CURRENT_TIMESTAMP`,
          [
            row.id,
            row.title,
            row.description,
            row.content,
            row.url,
            row.cover_image,
            row.publish_time,
            row.publish_date,
            row.mp_name,
            row.category,
          ]
        );
      }

      console.log(`已保存 ${newRows.length} 篇文章到数据库`);
    }

    return NextResponse.json({
      success: true,
      data: {
        feed: {
          id: result.feed.id,
          name: result.feed.mp_name,
        },
        totalFetched: articles.length,
        newArticles: newRows.length,
        skippedArticles: rows.length - newRows.length,
        categoryStats,
        fetchMoreResult,
      },
      message: `同步完成！获取 ${articles.length} 篇文章，新增 ${newRows.length} 篇`,
    });
  } catch (error) {
    console.error("同步失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "同步失败",
    }, { status: 500 });
  }
}

/**
 * 触发 We-MP-RSS 抓取更多历史文章
 */
async function triggerFetchMore(
  pages: number, 
  username: string, 
  password: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // 登录获取 Token
    const token = await loginWithCredentials(username, password);
    if (!token) {
      return { success: false, error: "登录 We-MP-RSS 失败，请检查用户名和密码" };
    }
    
    const authHeaders = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    // 获取公众号列表 - 使用正确的端点
    console.log("获取公众号列表...");
    const feedsResponse = await fetch(`${WEMPRSS_URL}/api/v1/wx/mps?limit=100`, {
      headers: authHeaders,
    });
    
    if (!feedsResponse.ok) {
      return { success: false, error: `获取公众号列表失败: ${feedsResponse.status}` };
    }
    
    const feedsData = await feedsResponse.json();
    const feeds = feedsData.data?.list || feedsData.list || [];
    console.log(`找到 ${feeds.length} 个公众号`);
    
    // 找到锦秋集
    const jinqiuFeed = feeds.find((f: any) => f.mp_name === DEFAULT_MP_NAME);
    if (!jinqiuFeed) {
      return { success: false, error: `未找到公众号: ${DEFAULT_MP_NAME}，可用公众号: ${feeds.map((f: any) => f.mp_name).join(', ')}` };
    }
    
    console.log(`找到公众号: ${jinqiuFeed.mp_name}, ID: ${jinqiuFeed.id}`);
    
    // 触发抓取更多页面 - 使用正确的端点
    console.log(`触发抓取 ${pages} 页文章...`);
    const updateResponse = await fetch(
      `${WEMPRSS_URL}/api/v1/wx/mps/update/${jinqiuFeed.id}?start_page=0&end_page=${pages}`,
      { headers: authHeaders }
    );
    
    const updateData = await updateResponse.json();
    console.log("抓取响应:", JSON.stringify(updateData).substring(0, 500));
    
    const articlesFound = updateData.data?.total || 0;
    
    return {
      success: updateData.code === 0,
      data: {
        feedId: jinqiuFeed.id,
        feedName: jinqiuFeed.mp_name,
        pagesRequested: pages,
        articlesFound,
        message: updateData.message,
      },
    };
  } catch (error) {
    console.error("触发抓取失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "触发抓取失败",
    };
  }
}
