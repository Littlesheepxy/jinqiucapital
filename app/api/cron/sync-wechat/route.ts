/**
 * 定时同步微信公众号文章
 * 
 * Cron Job - 每天自动抓取最新文章并保存到 PostgreSQL
 * 配置在 vercel.json 中（用于 Vercel）或使用系统 cron
 */

import { NextResponse } from "next/server";
import { query, checkConnection } from "@/lib/db";
import {
  getArticlesByMpName,
  type WeMpRssArticle,
} from "@/lib/wemprss";
import { categorizeArticle, extractDescription, formatDate } from "@/lib/wechat-categories";

const CRON_SECRET = process.env.CRON_SECRET || "";
const DEFAULT_MP_NAME = "锦秋集";

// 检查数据库配置
function checkDbConfig(): boolean {
  return !!(process.env.DB_HOST || process.env.DB_NAME)
}

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // 验证 Cron Secret（防止未授权调用）
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] 开始同步微信公众号文章到数据库...");

    if (!checkDbConfig()) {
      return NextResponse.json({
        success: false,
        error: "数据库未配置",
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: "数据库连接失败",
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // 从 We-MP-RSS 获取文章
    const result = await getArticlesByMpName(DEFAULT_MP_NAME, 200, 0);

    if (!result.feed) {
      return NextResponse.json({
        success: false,
        error: `未找到公众号: ${DEFAULT_MP_NAME}`,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    const articles = result.articles;
    console.log(`[Cron] 从 We-MP-RSS 获取到 ${articles.length} 篇文章`);

    // 获取已存在的文章 ID
    const existing = await query<{ id: string }>("SELECT id FROM wechat_articles");
    const existingIds = new Set(existing?.map(row => row.id) || []);

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

    // 过滤出新文章
    const newRows = rows.filter(row => !existingIds.has(row.id));

    // 统计分类
    const categoryStats: Record<string, number> = {};
    newRows.forEach(row => {
      const cat = row.category || "uncategorized";
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // 保存新文章到数据库
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

      console.log(`[Cron] 已保存 ${newRows.length} 篇新文章到数据库`);
    } else {
      console.log("[Cron] 没有新文章需要保存");
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      data: {
        feed: {
          id: result.feed.id,
          name: result.feed.mp_name,
        },
        totalFetched: articles.length,
        existingArticles: existingIds.size,
        newArticles: newRows.length,
        categoryStats,
      },
      message: `同步完成！获取 ${articles.length} 篇，新增 ${newRows.length} 篇`,
    });
  } catch (error) {
    console.error("[Cron] 同步失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "同步失败",
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
    }, { status: 500 });
  }
}
