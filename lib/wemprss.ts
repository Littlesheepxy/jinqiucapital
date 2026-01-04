/**
 * We-MP-RSS 客户端
 * 
 * 用于从 We-MP-RSS 服务获取微信公众号文章
 * 使用公开的 RSS/JSON feed 接口，无需登录认证
 */

// We-MP-RSS 服务配置
const WEMPRSS_URL = process.env.WEMPRSS_URL || "http://81.70.105.204:8001";

// 锦秋集的固定 ID
const JINQIU_FEED_ID = "MP_WXS_3887776643";

/**
 * 文章类型
 */
export interface WeMpRssArticle {
  id: string;
  title: string;
  content: string;
  description?: string;
  url: string;
  pic_url?: string;
  publish_time: number;
  mp_id: string;
  mp_name?: string;
  status?: number;
}

/**
 * 公众号类型
 */
export interface WeMpRssFeed {
  id: string;
  mp_name: string;
  mp_cover?: string;
  mp_intro?: string;
  status: number;
  created_at: string;
}

/**
 * JSON Feed 文章类型（We-MP-RSS 格式）
 */
interface JsonFeedArticle {
  id: string;
  title: string;
  description?: string;
  link: string;
  content?: string;
  updated?: string;
  channel_name?: string;
  feed?: {
    id: string;
    name: string;
    cover: string;
    intro: string;
  };
}

/**
 * 从 JSON Feed 获取公众号列表（公开接口，无需认证）
 */
export async function getFeeds(): Promise<WeMpRssFeed[]> {
  try {
    const response = await fetch(`${WEMPRSS_URL}/rss`);
    
    if (!response.ok) {
      throw new Error(`获取公众号列表失败: ${response.status}`);
    }

    // 解析 RSS XML
    const xml = await response.text();
    const feeds: WeMpRssFeed[] = [];
    
    // 简单解析 XML 中的 item
    const itemRegex = /<item>[\s\S]*?<id>(.*?)<\/id>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<description>(.*?)<\/description>[\s\S]*?<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null) {
      feeds.push({
        id: match[1],
        mp_name: match[2],
        mp_intro: match[3],
        status: 1,
        created_at: new Date().toISOString(),
      });
    }
    
    return feeds;
  } catch (error) {
    console.error("获取公众号列表错误:", error);
    return [];
  }
}

/**
 * 获取指定公众号的文章列表（通过 JSON feed，无需认证）
 */
export async function getArticlesByFeed(
  mpId: string,
  limit = 50
): Promise<WeMpRssArticle[]> {
  try {
    const response = await fetch(
      `${WEMPRSS_URL}/feed/${mpId}.json?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`获取文章列表失败: ${response.status}`);
    }

    const data = await response.json();
    const items: JsonFeedArticle[] = data.items || [];
    
    // 转换为统一格式
    return items.map((item, index) => ({
      id: item.id || `${mpId}_${index}`,
      title: item.title || "",
      content: item.content || "",
      description: item.description || "",
      url: item.link || "",
      pic_url: item.feed?.cover,
      publish_time: item.updated 
        ? Math.floor(new Date(item.updated).getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      mp_id: mpId,
      mp_name: item.feed?.name || item.channel_name || data.name || "锦秋集",
    }));
  } catch (error) {
    console.error("获取文章列表错误:", error);
    return [];
  }
}

/**
 * 获取文章详情（通过公开接口）
 */
export async function getArticleDetail(articleId: string): Promise<WeMpRssArticle | null> {
  try {
    const response = await fetch(`${WEMPRSS_URL}/articles/${articleId}?content=true`);
    
    if (!response.ok) {
      throw new Error(`获取文章详情失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("获取文章详情错误:", error);
    return null;
  }
}

/**
 * 通过公众号名称查找并获取文章
 * @param mpName 公众号名称，如 "锦秋集"
 */
export async function getArticlesByMpName(
  mpName: string,
  limit = 50,
  offset = 0
): Promise<{ feed: WeMpRssFeed | null; articles: WeMpRssArticle[]; total: number }> {
  try {
    // 获取所有公众号
    const feeds = await getFeeds();
    
    // 查找匹配的公众号
    let feed = feeds.find(f => f.mp_name === mpName || f.mp_name.includes(mpName));
    
    // 如果是锦秋集但没找到，使用固定 ID
    if (!feed && (mpName === "锦秋集" || mpName.includes("锦秋"))) {
      feed = {
        id: JINQIU_FEED_ID,
        mp_name: "锦秋集",
        mp_intro: "锦秋基金官方公众号",
        status: 1,
        created_at: new Date().toISOString(),
      };
    }
    
    if (!feed) {
      return { feed: null, articles: [], total: 0 };
    }

    // 获取该公众号的文章
    const allArticles = await getArticlesByFeed(feed.id, 100);
    
    // 按时间倒序排序
    allArticles.sort((a, b) => (b.publish_time || 0) - (a.publish_time || 0));
    
    // 分页
    const paginatedArticles = allArticles.slice(offset, offset + limit);
    
    return {
      feed,
      articles: paginatedArticles,
      total: allArticles.length,
    };
  } catch (error) {
    console.error("获取公众号文章错误:", error);
    return { feed: null, articles: [], total: 0 };
  }
}

/**
 * 搜索公众号（从已订阅列表中搜索）
 */
export async function searchFeeds(keyword: string): Promise<WeMpRssFeed[]> {
  try {
    const feeds = await getFeeds();
    return feeds.filter(f => 
      f.mp_name.includes(keyword) || f.mp_intro?.includes(keyword)
    );
  } catch (error) {
    console.error("搜索公众号错误:", error);
    return [];
  }
}

/**
 * 获取所有文章（从所有已订阅公众号）
 */
export async function getAllArticles(
  limit = 20,
  offset = 0,
  search?: string
): Promise<{ list: WeMpRssArticle[]; total: number }> {
  try {
    const feeds = await getFeeds();
    let allArticles: WeMpRssArticle[] = [];
    
    // 从每个公众号获取文章
    for (const feed of feeds.slice(0, 5)) { // 限制只取前 5 个公众号
      const articles = await getArticlesByFeed(feed.id, 20);
      allArticles = allArticles.concat(articles);
    }
    
    // 按时间排序
    allArticles.sort((a, b) => (b.publish_time || 0) - (a.publish_time || 0));
    
    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      allArticles = allArticles.filter(a => 
        a.title?.toLowerCase().includes(searchLower) ||
        a.content?.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      list: allArticles.slice(offset, offset + limit),
      total: allArticles.length,
    };
  } catch (error) {
    console.error("获取所有文章错误:", error);
    return { list: [], total: 0 };
  }
}

/**
 * 获取 RSS Feed URL
 */
export function getRssFeedUrl(feedId: string, format: "xml" | "json" = "xml"): string {
  return `${WEMPRSS_URL}/feed/${feedId}.${format}`;
}

/**
 * 格式化发布时间
 */
export function formatPublishTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

