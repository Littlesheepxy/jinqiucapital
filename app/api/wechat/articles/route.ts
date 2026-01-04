/**
 * 微信公众号文章 API
 * 
 * 优先从 Supabase 数据库读取缓存的文章
 * 如果数据库为空，则从 We-MP-RSS 获取并缓存
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getArticlesByMpName,
  type WeMpRssArticle,
} from "@/lib/wemprss";

// Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// 默认获取的公众号名称
const DEFAULT_MP_NAME = "锦秋集";

// 栏目配置（slug -> 配置）
export const CATEGORIES: Record<string, { name: { zh: string; en: string }; keywords: string[] }> = {
  "jinqiu-select": {
    name: { zh: "Jinqiu Select", en: "Jinqiu Select" },
    keywords: ["精选", "Select", "报告", "研究", "解读"],
  },
  "jinqiu-scan": {
    name: { zh: "Jinqiu Scan", en: "Jinqiu Scan" },
    keywords: ["扫描", "Scan", "测评", "产品", "工具"],
  },
  "jinqiu-spotlight": {
    name: { zh: "Jinqiu Spotlight", en: "Jinqiu Spotlight" },
    keywords: ["Spotlight", "聚光", "创业者", "专访"],
  },
  "jinqiu-roundtable": {
    name: { zh: "锦秋小饭桌", en: "Jinqiu Roundtable" },
    keywords: ["小饭桌", "Roundtable", "饭局", "聚餐"],
  },
  "jinqiu-summit": {
    name: { zh: "锦秋会", en: "Jinqiu Summit" },
    keywords: ["锦秋会", "Summit", "峰会", "大会"],
  },
};

// 文章分类函数
export function categorizeArticle(article: { title?: string; content?: string }): string | null {
  const title = article.title?.toLowerCase() || "";
  const content = (article.content?.substring(0, 500) || "").toLowerCase();
  
  for (const [slug, config] of Object.entries(CATEGORIES)) {
    if (config.keywords.some(kw => 
      title.includes(kw.toLowerCase()) || content.includes(kw.toLowerCase())
    )) {
      return slug;
    }
  }
  return null; // 未分类
}

// 格式化单篇文章（用于 We-MP-RSS 数据）
function formatArticleFromWeMpRss(article: WeMpRssArticle, feedName?: string) {
  return {
    id: article.id,
    title: article.title,
    description: article.description || extractDescription(article.content),
    content: article.content,
    url: article.url,
    coverImage: article.pic_url,
    publishTime: article.publish_time,
    publishDate: formatDate(article.publish_time),
    mpName: article.mp_name || feedName,
    category: categorizeArticle(article),
  };
}

// 格式化数据库文章
function formatArticleFromDb(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    url: row.url,
    coverImage: row.cover_image,
    publishTime: row.publish_time,
    publishDate: row.publish_date,
    mpName: row.mp_name,
    category: row.category,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mpName = searchParams.get("mp") || DEFAULT_MP_NAME;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const action = searchParams.get("action");
    const category = searchParams.get("category"); // 栏目 slug
    const search = searchParams.get("search"); // 自定义搜索词
    const grouped = searchParams.get("grouped") === "true"; // 是否分组返回
    const refresh = searchParams.get("refresh") === "true"; // 强制刷新

    // 获取分类配置
    if (action === "categories") {
      return NextResponse.json({
        success: true,
        data: CATEGORIES,
      });
    }

    // 优先从 Supabase 读取（除非强制刷新）
    if (supabase && !refresh) {
      const dbResult = await getArticlesFromDb(category, search, limit, offset, grouped);
      if (dbResult) {
        return NextResponse.json({
          success: true,
          source: "database",
          ...dbResult,
        });
      }
    }

    // 如果数据库没有数据或强制刷新，从 We-MP-RSS 获取
    const result = await getArticlesByMpName(mpName, 200, 0);

    if (!result.feed) {
      return NextResponse.json({
        success: false,
        error: `未找到公众号: ${mpName}`,
        suggestion: "请先在 We-MP-RSS 中订阅该公众号",
      }, { status: 404 });
    }

    // 按时间倒序排序
    const sortedArticles = [...result.articles].sort((a, b) => 
      (b.publish_time || 0) - (a.publish_time || 0)
    );

    // 格式化并分类
    const formattedArticles = sortedArticles.map(article => 
      formatArticleFromWeMpRss(article, result.feed?.mp_name)
    );

    // 异步保存到数据库（不阻塞响应）
    if (supabase) {
      saveArticlesToDb(formattedArticles).catch(err => 
        console.error("保存文章到数据库失败:", err)
      );
    }

    // 如果请求分组返回所有分类
    if (grouped) {
      const categorizedArticles: Record<string, any[]> = {};
      const uncategorized: any[] = [];

      // 初始化所有分类
      Object.keys(CATEGORIES).forEach(slug => {
        categorizedArticles[slug] = [];
      });

      // 分类文章
      formattedArticles.forEach(article => {
        if (article.category) {
          categorizedArticles[article.category].push(article);
        } else {
          uncategorized.push(article);
        }
      });

      return NextResponse.json({
        success: true,
        source: "wemprss",
        data: {
          feed: {
            id: result.feed.id,
            name: result.feed.mp_name,
            cover: result.feed.mp_cover,
            intro: result.feed.mp_intro,
          },
          categories: CATEGORIES,
          articles: categorizedArticles,
          uncategorized,
          totalArticles: sortedArticles.length,
        },
      });
    }

    // 按单个栏目筛选
    let filteredArticles = formattedArticles;

    if (category && CATEGORIES[category]) {
      filteredArticles = formattedArticles.filter(article => article.category === category);
    }

    // 自定义搜索
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter(article => {
        const title = article.title?.toLowerCase() || "";
        const content = article.content?.toLowerCase() || "";
        return title.includes(searchLower) || content.includes(searchLower);
      });
    }

    // 分页
    const total = filteredArticles.length;
    const paginatedArticles = filteredArticles.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      source: "wemprss",
      data: {
        feed: {
          id: result.feed.id,
          name: result.feed.mp_name,
          cover: result.feed.mp_cover,
          intro: result.feed.mp_intro,
        },
        articles: paginatedArticles,
        total,
        category,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error("获取微信文章失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "获取文章失败",
    }, { status: 500 });
  }
}

/**
 * 从数据库获取文章
 */
async function getArticlesFromDb(
  category: string | null, 
  search: string | null, 
  limit: number, 
  offset: number,
  grouped: boolean
) {
  if (!supabase) return null;

  try {
    // 先检查是否有数据
    const { count } = await supabase
      .from("wechat_articles")
      .select("*", { count: "exact", head: true });

    if (!count || count === 0) {
      return null; // 数据库为空，需要从 We-MP-RSS 获取
    }

    if (grouped) {
      // 获取所有文章并分组
      const { data: allArticles, error } = await supabase
        .from("wechat_articles")
        .select("*")
        .order("publish_time", { ascending: false });

      if (error) throw error;

      const categorizedArticles: Record<string, any[]> = {};
      const uncategorized: any[] = [];

      Object.keys(CATEGORIES).forEach(slug => {
        categorizedArticles[slug] = [];
      });

      allArticles?.forEach(row => {
        const article = formatArticleFromDb(row);
        if (article.category && categorizedArticles[article.category]) {
          categorizedArticles[article.category].push(article);
        } else {
          uncategorized.push(article);
        }
      });

      return {
        data: {
          categories: CATEGORIES,
          articles: categorizedArticles,
          uncategorized,
          totalArticles: allArticles?.length || 0,
        },
      };
    }

    // 构建查询
    let query = supabase
      .from("wechat_articles")
      .select("*", { count: "exact" });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error, count: totalCount } = await query
      .order("publish_time", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const articles = data?.map(formatArticleFromDb) || [];

    return {
      data: {
        articles,
        total: totalCount || 0,
        category,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < (totalCount || 0),
        },
      },
    };
  } catch (error) {
    console.error("从数据库获取文章失败:", error);
    return null; // 失败时 fallback 到 We-MP-RSS
  }
}

/**
 * 保存文章到数据库
 */
async function saveArticlesToDb(articles: any[]) {
  if (!supabase || articles.length === 0) return;

  try {
    const rows = articles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      cover_image: article.coverImage,
      publish_time: article.publishTime,
      publish_date: article.publishDate,
      mp_name: article.mpName,
      category: article.category,
    }));

    // 使用 upsert 避免重复
    const { error } = await supabase
      .from("wechat_articles")
      .upsert(rows, { 
        onConflict: "id",
        ignoreDuplicates: false,
      });

    if (error) throw error;

    console.log(`已保存 ${rows.length} 篇文章到数据库`);
  } catch (error) {
    console.error("保存文章到数据库失败:", error);
    throw error;
  }
}

/**
 * 从内容中提取描述
 */
function extractDescription(content: string, maxLength = 200): string {
  if (!content) return "";
  
  // 移除 HTML 标签
  const text = content.replace(/<[^>]+>/g, "").trim();
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
}

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
