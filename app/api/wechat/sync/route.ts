/**
 * 微信公众号文章同步 API
 * 
 * 从 We-MP-RSS 抓取文章并保存到 Supabase 数据库
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getArticlesByMpName,
  type WeMpRssArticle,
} from "@/lib/wemprss";
import { CATEGORIES, categorizeArticle } from "../articles/route";

const WEMPRSS_URL = process.env.WEMPRSS_URL || "http://81.70.105.204:8001";

// Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// 默认获取的公众号名称
const DEFAULT_MP_NAME = "锦秋集";

/**
 * 格式化日期
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 从内容中提取描述
 */
function extractDescription(content: string, maxLength = 200): string {
  if (!content) return "";
  const text = content.replace(/<[^>]+>/g, "").trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * GET: 获取同步状态
 */
export async function GET() {
  try {
    let dbStats = null;
    
    if (supabase) {
      // 获取数据库统计
      const { count: totalCount } = await supabase
        .from("wechat_articles")
        .select("*", { count: "exact", head: true });

      // 获取各分类数量
      const categoryStats: Record<string, number> = {};
      for (const slug of Object.keys(CATEGORIES)) {
        const { count } = await supabase
          .from("wechat_articles")
          .select("*", { count: "exact", head: true })
          .eq("category", slug);
        categoryStats[slug] = count || 0;
      }

      // 获取最新和最早文章时间
      const { data: latest } = await supabase
        .from("wechat_articles")
        .select("publish_date, updated_at")
        .order("publish_time", { ascending: false })
        .limit(1)
        .single();

      const { data: oldest } = await supabase
        .from("wechat_articles")
        .select("publish_date")
        .order("publish_time", { ascending: true })
        .limit(1)
        .single();

      dbStats = {
        totalArticles: totalCount || 0,
        categoryStats,
        latestArticle: latest?.publish_date,
        oldestArticle: oldest?.publish_date,
        lastSyncTime: latest?.updated_at,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        supabaseConfigured: !!supabase,
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
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { limit = 200, forceUpdate = false } = body;

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: "Supabase 未配置，无法保存文章",
        suggestion: "请配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量",
      }, { status: 500 });
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
      const { data: existing } = await supabase
        .from("wechat_articles")
        .select("id");
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
      const { error } = await supabase
        .from("wechat_articles")
        .upsert(newRows, { 
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (error) {
        throw new Error(`保存文章失败: ${error.message}`);
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
