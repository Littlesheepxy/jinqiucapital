/**
 * 微信公众号文章 API
 * 
 * 从 We-MP-RSS 服务获取锦秋集的文章
 * 支持按分类/栏目筛选
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

// 栏目关键词映射（slug -> 搜索关键词）
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "jinqiu-select": ["精选", "Select", "报告", "研究"],
  "jinqiu-scan": ["扫描", "Scan", "测评", "产品"],
  "jinqiu-spotlight": ["Spotlight", "聚光", "创业者"],
  "jinqiu-roundtable": ["小饭桌", "Roundtable", "饭局"],
  "jinqiu-summit": ["锦秋会", "Summit", "峰会"],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mpName = searchParams.get("mp") || DEFAULT_MP_NAME;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const action = searchParams.get("action");
    const category = searchParams.get("category"); // 栏目 slug
    const search = searchParams.get("search"); // 自定义搜索词

    // 获取所有公众号列表
    if (action === "feeds") {
      const feeds = await getFeeds();
      return NextResponse.json({
        success: true,
        data: feeds,
      });
    }

    // 获取指定公众号的文章
    const result = await getArticlesByMpName(mpName, 100, 0); // 先获取更多文章用于筛选

    if (!result.feed) {
      return NextResponse.json({
        success: false,
        error: `未找到公众号: ${mpName}`,
        suggestion: "请先在 We-MP-RSS 中订阅该公众号",
      }, { status: 404 });
    }

    let filteredArticles = result.articles;

    // 按栏目筛选
    if (category && CATEGORY_KEYWORDS[category]) {
      const keywords = CATEGORY_KEYWORDS[category];
      filteredArticles = result.articles.filter((article: WeMpRssArticle) => {
        const title = article.title?.toLowerCase() || "";
        const content = article.content?.toLowerCase() || "";
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

    // 转换文章格式，适配前端显示
    const articles = paginatedArticles.map((article: WeMpRssArticle) => ({
      id: article.id,
      title: article.title,
      description: article.description || extractDescription(article.content),
      content: article.content,
      url: article.url,
      coverImage: article.pic_url,
      publishTime: article.publish_time,
      publishDate: formatDate(article.publish_time),
      mpName: article.mp_name || result.feed?.mp_name,
    }));

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

