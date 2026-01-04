import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jinqiucapital.com'

// 获取所有文章（用于生成 sitemap）
async function getArticleSlugs() {
  try {
    const res = await fetch(`${process.env.WEMPRSS_URL || 'http://81.70.105.204:8001'}/feed/MP_WXS_3887776643.json?limit=200`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || []).map((item: any) => ({
      id: item.id,
      lastModified: item.updated ? new Date(item.updated) : new Date(),
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticleSlugs()
  
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
  
  // Library 分类页面
  const categories = [
    'jinqiu-select',
    'jinqiu-scan', 
    'jinqiu-spotlight',
    'jinqiu-roundtable',
    'jinqiu-summit',
  ]
  
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE_URL}/library/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))
  
  // 文章详情页
  const articlePages: MetadataRoute.Sitemap = []
  for (const cat of categories) {
    for (const article of articles.slice(0, 50)) { // 限制数量
      articlePages.push({
        url: `${BASE_URL}/library/${cat}/wechat/${article.id}`,
        lastModified: article.lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    }
  }
  
  return [...staticPages, ...categoryPages, ...articlePages]
}

