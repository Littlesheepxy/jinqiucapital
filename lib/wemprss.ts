/**
 * We-MP-RSS 客户端
 * 
 * 用于从 We-MP-RSS 服务获取微信公众号文章
 * 使用公开的 RSS/JSON feed 接口，无需登录认证
 */

// We-MP-RSS 服务配置
const WEMPRSS_URL = process.env.WEMPRSS_URL || "http://81.70.105.204:8001";
const WEMPRSS_USERNAME = process.env.WEMPRSS_USERNAME || "";
const WEMPRSS_PASSWORD = process.env.WEMPRSS_PASSWORD || "";

// 锦秋集的固定 ID
const JINQIU_FEED_ID = "MP_WXS_3887776643";

// Token 缓存
let cachedApiToken: string | null = null;
let apiTokenExpiry: number = 0;

/**
 * 获取 API Token（用于需要认证的接口）
 */
async function getApiToken(): Promise<string | null> {
  // 检查缓存
  if (cachedApiToken && apiTokenExpiry > Date.now()) {
    return cachedApiToken;
  }
  
  if (!WEMPRSS_USERNAME || !WEMPRSS_PASSWORD) {
    return null;
  }
  
  try {
    const response = await fetch(`${WEMPRSS_URL}/api/v1/wx/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(WEMPRSS_USERNAME)}&password=${encodeURIComponent(WEMPRSS_PASSWORD)}`,
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    const token = data.access_token || data.data?.access_token;
    
    if (token) {
      cachedApiToken = token;
      // Token 有效期设为 3 天减 1 小时
      apiTokenExpiry = Date.now() + (3 * 24 - 1) * 60 * 60 * 1000;
      return token;
    }
  } catch (error) {
    console.error("获取 API Token 失败:", error);
  }
  
  return null;
}

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
 * 获取指定公众号的文章列表
 * 
 * 优先使用 API 接口（可获取全部文章），回退到 JSON Feed
 */
export async function getArticlesByFeed(
  mpId: string,
  limit = 200
): Promise<WeMpRssArticle[]> {
  try {
    // 尝试使用 API 接口获取所有文章（支持分页，可获取全部）
    const articles = await getArticlesFromApi(mpId, limit);
    if (articles.length > 0) {
      console.log(`API 接口获取到 ${articles.length} 篇文章`);
      return articles;
    }
    
    // 回退到 JSON Feed（公开接口，不需要认证）
    console.log("API 接口未返回数据，使用 JSON Feed...");
    return await getArticlesFromJsonFeed(mpId, limit);
  } catch (error) {
    console.error("获取文章列表错误:", error);
    return [];
  }
}

/**
 * 从 JSON Feed 获取文章（公开接口，不需要认证）
 * 注意：We-MP-RSS 的 JSON Feed 最大支持 50 条
 */
async function getArticlesFromJsonFeed(
  mpId: string,
  limit = 50
): Promise<WeMpRssArticle[]> {
  try {
    // JSON Feed 最大支持 50 条
    const actualLimit = Math.min(limit, 50);
    const response = await fetch(
      `${WEMPRSS_URL}/feed/${mpId}.json?limit=${actualLimit}`
    );
    
    if (!response.ok) {
      console.error(`JSON Feed 请求失败: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const items = data.items || [];
    
    console.log(`JSON Feed 返回 ${items.length} 篇文章`);
    
    // 转换为统一格式
    return items.map((item: any) => ({
      id: item.id || `${mpId}_${Date.now()}`,
      title: item.title || "",
      content: item.content || "",
      description: item.description || "",
      url: item.link || "",
      pic_url: item.feed?.cover || data.cover,
      publish_time: item.updated 
        ? Math.floor(new Date(item.updated).getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      mp_id: mpId,
      mp_name: item.channel_name || data.name || "锦秋集",
    }));
  } catch (error) {
    console.error("JSON Feed 获取失败:", error);
    return [];
  }
}

/**
 * 从 API 接口获取文章（支持分页，可获取全部）
 * 需要认证 Token
 */
async function getArticlesFromApi(
  mpId: string,
  limit = 200
): Promise<WeMpRssArticle[]> {
  const allArticles: WeMpRssArticle[] = [];
  let offset = 0;
  const pageSize = 100; // API 每页最多 100 条
  
  try {
    // 获取认证 Token
    const token = await getApiToken();
    if (!token) {
      console.log("未配置认证凭据，跳过 API 接口");
      return [];
    }
    
    const headers: HeadersInit = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    while (allArticles.length < limit) {
      const response = await fetch(
        `${WEMPRSS_URL}/api/v1/wx/articles?mp_id=${mpId}&limit=${pageSize}&offset=${offset}&has_content=true`,
        { headers }
      );
      
      if (!response.ok) {
        console.log(`API 接口返回 ${response.status}`);
        break;
      }

      const data = await response.json();
      const items = data.data?.list || [];
      const total = data.data?.total || 0;
      
      if (items.length === 0) break;
      
      // 转换为统一格式
      const articles = items.map((item: any) => ({
        id: item.id || `${mpId}_${offset}`,
        title: item.title || "",
        content: item.content || "",
        description: item.description || "",
        url: item.url || "",
        pic_url: item.pic_url,
        publish_time: item.publish_time || Math.floor(Date.now() / 1000),
        mp_id: mpId,
        mp_name: item.mp_name || "锦秋集",
        status: item.status,
      }));
      
      allArticles.push(...articles);
      offset += pageSize;
      
      console.log(`API 获取进度: ${allArticles.length}/${total}`);
      
      // 如果已获取全部或达到限制
      if (offset >= total || allArticles.length >= limit) break;
    }
    
    return allArticles;
  } catch (error) {
    console.error("API 接口获取失败:", error);
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
 * @param limit 最大获取数量（默认 200，可获取全部）
 * @param offset 起始位置
 */
export async function getArticlesByMpName(
  mpName: string,
  limit = 200,
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

    // 获取该公众号的文章（使用 API 接口可获取全部）
    const allArticles = await getArticlesByFeed(feed.id, limit + offset);
    
    // 按时间倒序排序
    allArticles.sort((a, b) => (b.publish_time || 0) - (a.publish_time || 0));
    
    // 分页（如果需要）
    const paginatedArticles = offset > 0 
      ? allArticles.slice(offset, offset + limit)
      : allArticles.slice(0, limit);
    
    console.log(`获取到 ${allArticles.length} 篇文章，返回 ${paginatedArticles.length} 篇`);
    
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

