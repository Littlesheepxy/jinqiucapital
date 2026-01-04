/**
 * 微信公众号文章 API
 * 
 * 从 We-MP-RSS 服务获取锦秋集的文章
 * 支持按分类/栏目筛选，支持获取所有分类
 */

import { NextResponse } from "next/server";
import {
  getArticlesByMpName,
  getAllArticles,
  getFeeds,
  type WeMpRssArticle,
  type WeMpRssFeed,
} from "@/lib/wemprss";

// 默认获取的公众号名称
const DEFAULT_MP_NAME = "锦秋集";

// 栏目配置（slug -> 配置）
const CATEGORIES: Record<string, { name: { zh: string; en: string }; keywords: string[] }> = {
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
function categorizeArticle(article: WeMpRssArticle): string | null {
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

// 格式化单篇文章
function formatArticle(article: WeMpRssArticle, feedName?: string) {
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

    // 获取所有公众号列表
    if (action === "feeds") {
      const feeds = await getFeeds();
      return NextResponse.json({
        success: true,
        data: feeds,
      });
    }

    // 获取分类配置
    if (action === "categories") {
      return NextResponse.json({
        success: true,
        data: CATEGORIES,
      });
    }

    // 获取指定公众号的所有文章
    const result = await getArticlesByMpName(mpName, 200, 0); // 获取更多文章

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

    // 如果请求分组返回所有分类
    if (grouped) {
      const categorizedArticles: Record<string, any[]> = {};
      const uncategorized: any[] = [];

      // 初始化所有分类
      Object.keys(CATEGORIES).forEach(slug => {
        categorizedArticles[slug] = [];
      });

      // 分类文章
      sortedArticles.forEach((article: WeMpRssArticle) => {
        const categorySlug = categorizeArticle(article);
        const formatted = formatArticle(article, result.feed?.mp_name);
        
        if (categorySlug) {
          categorizedArticles[categorySlug].push(formatted);
        } else {
          uncategorized.push(formatted);
        }
      });

      return NextResponse.json({
        success: true,
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
    let filteredArticles = sortedArticles;

    if (category && CATEGORIES[category]) {
      const keywords = CATEGORIES[category].keywords;
      filteredArticles = sortedArticles.filter((article: WeMpRssArticle) => {
        const title = article.title?.toLowerCase() || "";
        const content = (article.content?.substring(0, 500) || "").toLowerCase();
        return keywords.some(kw => 
          title.includes(kw.toLowerCase()) || content.includes(kw.toLowerCase())
        );
      });
    }

    // 自定义搜索
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter((article: WeMpRssArticle) => {
        const title = article.title?.toLowerCase() || "";
        const content = article.content?.toLowerCase() || "";
        return title.includes(searchLower) || content.includes(searchLower);
      });
    }

    // 分页
    const total = filteredArticles.length;
    const paginatedArticles = filteredArticles.slice(offset, offset + limit);

    // 转换文章格式
    const articles = paginatedArticles.map((article: WeMpRssArticle) => 
      formatArticle(article, result.feed?.mp_name)
    );

    return NextResponse.json({
      success: true,
      data: {
        feed: {
          id: result.feed.id,
          name: result.feed.mp_name,
          cover: result.feed.mp_cover,
          intro: result.feed.mp_intro,
        },
        articles,
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

