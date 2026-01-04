/**
 * We-MP-RSS 客户端
 * 
 * 用于从 We-MP-RSS 服务获取微信公众号文章
 */

// We-MP-RSS 服务配置
const WEMPRSS_URL = process.env.WEMPRSS_URL || "http://81.70.105.204:8001";
const WEMPRSS_USERNAME = process.env.WEMPRSS_USERNAME || "";
const WEMPRSS_PASSWORD = process.env.WEMPRSS_PASSWORD || "";

// Token 缓存
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

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
 * 登录获取 Token
 */
async function login(): Promise<string> {
  // 尝试多个登录端点（兼容不同版本）
  const endpoints = [
    "/api/v1/wx/auth/login",  // rachelos/we-mp-rss
    "/api/v1/login",          // cooderl/wewe-rss
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${WEMPRSS_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: WEMPRSS_USERNAME,
          password: WEMPRSS_PASSWORD,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      
      // 检查是否返回错误
      if (data.detail || data.error) continue;

      // 提取 token（兼容不同响应格式）
      const token = data.access_token || data.data?.access_token;
      if (token) {
        return token;
      }
    } catch {
      continue;
    }
  }

  throw new Error("无法登录 We-MP-RSS 服务");
}

/**
 * 获取有效的 Token
 */
async function getValidToken(): Promise<string> {
  // 检查缓存的 token 是否有效
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }

  // 重新登录获取新 token
  cachedToken = await login();
  // Token 有效期设为 3 天（减去 1 小时作为缓冲）
  tokenExpiry = Date.now() + (3 * 24 - 1) * 60 * 60 * 1000;

  return cachedToken;
}

/**
 * 发送认证请求
 */
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
 * 获取公众号列表
 */
export async function getFeeds(limit = 100, offset = 0): Promise<WeMpRssFeed[]> {
  try {
    const response = await fetchWithAuth(`/mps?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`获取公众号列表失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.list || [];
  } catch (error) {
    console.error("获取公众号列表错误:", error);
    return [];
  }
}

/**
 * 搜索公众号
 */
export async function searchFeeds(keyword: string): Promise<WeMpRssFeed[]> {
  try {
    const response = await fetchWithAuth(`/mps/search/${encodeURIComponent(keyword)}`);
    
    if (!response.ok) {
      throw new Error(`搜索公众号失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.list || [];
  } catch (error) {
    console.error("搜索公众号错误:", error);
    return [];
  }
}

/**
 * 获取指定公众号的文章列表
 */
export async function getArticlesByFeed(
  mpId: string,
  limit = 20,
  offset = 0
): Promise<WeMpRssArticle[]> {
  try {
    const response = await fetchWithAuth(
      `/articles?mp_id=${mpId}&limit=${limit}&offset=${offset}&has_content=true`
    );
    
    if (!response.ok) {
      throw new Error(`获取文章列表失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.list || [];
  } catch (error) {
    console.error("获取文章列表错误:", error);
    return [];
  }
}

/**
 * 获取所有文章
 */
export async function getAllArticles(
  limit = 20,
  offset = 0,
  search?: string
): Promise<{ list: WeMpRssArticle[]; total: number }> {
  try {
    let url = `/articles?limit=${limit}&offset=${offset}&has_content=true`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error(`获取文章列表失败: ${response.status}`);
    }

    const data = await response.json();
    return {
      list: data.data?.list || [],
      total: data.data?.total || 0,
    };
  } catch (error) {
    console.error("获取文章列表错误:", error);
    return { list: [], total: 0 };
  }
}

/**
 * 获取文章详情
 */
export async function getArticleDetail(articleId: string): Promise<WeMpRssArticle | null> {
  try {
    // 文章详情接口不需要认证
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
  limit = 20,
  offset = 0
): Promise<{ feed: WeMpRssFeed | null; articles: WeMpRssArticle[]; total: number }> {
  try {
    // 首先获取所有公众号
    const feeds = await getFeeds();
    
    // 查找匹配的公众号
    const feed = feeds.find(f => f.mp_name === mpName || f.mp_name.includes(mpName));
    
    if (!feed) {
      return { feed: null, articles: [], total: 0 };
    }

    // 获取该公众号的文章
    const articles = await getArticlesByFeed(feed.id, limit, offset);
    
    return {
      feed,
      articles,
      total: articles.length, // 暂时使用列表长度
    };
  } catch (error) {
    console.error("获取公众号文章错误:", error);
    return { feed: null, articles: [], total: 0 };
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

