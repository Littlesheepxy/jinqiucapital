/**
 * 微信文章分类配置和工具函数
 */

// 栏目配置（slug -> 配置）- 按显示顺序排列
export const CATEGORIES: Record<string, { name: { zh: string; en: string }; keywords: string[]; order: number }> = {
  "jinqiu-spotlight": {
    name: { zh: "Jinqiu Spotlight", en: "Jinqiu Spotlight" },
    keywords: ["Spotlight", "聚光", "创业者", "专访"],
    order: 1,
  },
  "jinqiu-select": {
    name: { zh: "Jinqiu Select", en: "Jinqiu Select" },
    keywords: ["精选", "Select", "报告", "研究", "解读"],
    order: 2,
  },
  "jinqiu-lab": {
    name: { zh: "锦秋AI实验室", en: "Jinqiu AI Lab" },
    keywords: ["实验室", "Lab", "测评", "产品", "工具", "AI实验", "Scan", "扫描"],
    order: 3,
  },
  "jinqiu-roundtable": {
    name: { zh: "锦秋小饭桌", en: "Jinqiu Roundtable" },
    keywords: ["小饭桌", "Roundtable", "饭局", "聚餐"],
    order: 4,
  },
  "jinqiu-summit": {
    name: { zh: "锦秋会", en: "Jinqiu Summit" },
    keywords: ["锦秋会", "Summit", "峰会", "大会"],
    order: 5,
  },
};

// 旧分类名到新分类名的映射（用于兼容旧数据）
export const CATEGORY_ALIASES: Record<string, string> = {
  "jinqiu-scan": "jinqiu-lab",
};

// 标准化分类名（将旧名称转为新名称）
export function normalizeCategory(category: string | null): string | null {
  if (!category) return null;
  return CATEGORY_ALIASES[category] || category;
}

/**
 * 根据文章标题和内容自动分类
 */
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

/**
 * 格式化日期
 */
export function formatDate(timestamp: number): string {
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
export function extractDescription(content: string, maxLength = 200): string {
  if (!content) return "";
  const text = content.replace(/<[^>]+>/g, "").trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}



