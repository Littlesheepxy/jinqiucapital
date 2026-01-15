/**
 * 微信公众号文章 API
 * 
 * 优先从 PostgreSQL 数据库读取缓存的文章
 * 如果数据库为空，则从 We-MP-RSS 获取并缓存
 */

import { NextResponse } from "next/server";
import { query, checkConnection } from "@/lib/db";
import {
  getArticlesByMpName,
  type WeMpRssArticle,
} from "@/lib/wemprss";
import { 
  CATEGORIES,
  CATEGORY_ALIASES,
  normalizeCategory,
  categorizeArticle, 
  extractDescription, 
  formatDate 
} from "@/lib/wechat-categories";

// 默认获取的公众号名称
const DEFAULT_MP_NAME = "锦秋集";

// 检查数据库配置
function checkDbConfig(): boolean {
  return !!(process.env.DB_HOST || process.env.DB_NAME)
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

// 格式化数据库文章（自动将旧分类名转为新分类名）
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
    category: normalizeCategory(row.category), // 标准化分类名
  };
}

// 获取分类及其别名（用于数据库查询）
function getCategoryWithAliases(category: string): string[] {
  const categories = [category];
  // 添加指向该分类的旧名称
  for (const [oldName, newName] of Object.entries(CATEGORY_ALIASES)) {
    if (newName === category) {
      categories.push(oldName);
    }
  }
  return categories;
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

    // 优先从数据库读取（除非强制刷新）
    if (checkDbConfig() && !refresh) {
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
    if (checkDbConfig()) {
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
  try {
    const connected = await checkConnection();
    if (!connected) return null;

    // 先检查是否有数据
    const countResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM wechat_articles WHERE hidden IS NULL OR hidden = false"
    );
    
    const count = parseInt(countResult[0]?.count || "0");
    if (count === 0) {
      return null; // 数据库为空，需要从 We-MP-RSS 获取
    }

    if (grouped) {
      // 获取所有非隐藏文章并分组
      const allArticles = await query(
        "SELECT * FROM wechat_articles WHERE hidden IS NULL OR hidden = false ORDER BY publish_time DESC"
      );

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
    let sql = "SELECT * FROM wechat_articles WHERE (hidden IS NULL OR hidden = false)";
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      const categoryList = getCategoryWithAliases(category);
      if (categoryList.length === 1) {
        sql += ` AND category = $${paramIndex++}`;
        params.push(category);
      } else {
        const placeholders = categoryList.map((_, i) => `$${paramIndex + i}`).join(', ');
        sql += ` AND category IN (${placeholders})`;
        params.push(...categoryList);
        paramIndex += categoryList.length;
      }
    }

    if (search) {
      sql += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += " ORDER BY publish_time DESC";

    // 获取总数
    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as count");
    const totalResult = await query<{ count: string }>(countSql, params);
    const totalCount = parseInt(totalResult[0]?.count || "0");

    // 分页
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const data = await query(sql, params);
    const articles = data?.map(formatArticleFromDb) || [];

    return {
      data: {
        articles,
        total: totalCount,
        category,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < totalCount,
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
  if (articles.length === 0) return;

  try {
    const connected = await checkConnection();
    if (!connected) return;

    for (const article of articles) {
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
          article.id,
          article.title,
          article.description,
          article.content,
          article.url,
          article.coverImage,
          article.publishTime,
          article.publishDate,
          article.mpName,
          article.category,
        ]
      );
    }

    console.log(`已保存 ${articles.length} 篇文章到数据库`);
  } catch (error) {
    console.error("保存文章到数据库失败:", error);
    throw error;
  }
}
