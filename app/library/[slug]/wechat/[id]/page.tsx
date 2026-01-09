"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface WechatArticle {
  id: string
  title: string
  content: string
  description: string
  url: string
  coverImage?: string
  publishDate: string
  mpName: string
}

export default function WechatArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const articleId = params.id as string
  
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [contentData, setContentData] = useState<any>(null)
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [article, setArticle] = useState<WechatArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Detect browser language
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.includes("en")) {
      setLanguage("en")
    }

    // Load content data for header
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContentData(data.content)
        const item = data.content.research.list.find((item: any) => item.slug === slug)
        setCurrentItem(item)
      })
      .catch((err) => console.error("Failed to load data:", err))

    // Load article from list
    fetchArticle()
  }, [slug, articleId])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      // 获取所有文章，然后找到匹配的
      const res = await fetch(`/api/wechat/articles?category=${slug}&limit=100`)
      const data = await res.json()
      
      if (data.success && data.data?.articles) {
        const found = data.data.articles.find((a: WechatArticle) => a.id === articleId)
        if (found) {
          setArticle(found)
        } else {
          setError("文章不存在")
        }
      } else {
        setError("加载失败")
      }
    } catch (err) {
      setError("加载失败")
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  // 通过代理加载微信图片（绕过防盗链）
  const proxyImage = (url: string) => {
    if (!url) return url
    // 微信图片通过 weserv.nl 代理加载
    if (url.includes('mmbiz.qpic.cn') || url.includes('mmbiz.wpimg.cn')) {
      // 移除协议前缀
      const cleanUrl = url.replace(/^https?:\/\//, '')
      return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}`
    }
    return url
  }

  // 清理并渲染 HTML 内容
  const cleanHtml = (html: string) => {
    if (!html) return ""
    
    let cleaned = html
      // 移除危险标签
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      // 修复微信表情图片尺寸
      .replace(/(<img[^>]*class="[^"]*wxw-img[^"]*"[^>]*)style="[^"]*width:\s*\d+px[^"]*"([^>]*>)/gi, 
        '$1style="display:inline-block;width:20px;height:20px;vertical-align:middle;"$2')
      // 将微信图片 URL 通过代理加载
      .replace(/src="(https?:\/\/mmbiz\.qpic\.cn[^"]+)"/gi, (match, url) => {
        return `src="${proxyImage(url)}"`
      })
      .replace(/src="(https?:\/\/mmbiz\.wpimg\.cn[^"]+)"/gi, (match, url) => {
        return `src="${proxyImage(url)}"`
      })
      // 删除"推荐阅读"部分及其后面的所有内容（包括图片链接）
      .replace(/(<[^>]*>)*\s*(推荐阅读|相关阅读|延伸阅读|往期推荐|往期回顾)\s*[:：]?\s*[\s\S]*$/gi, '')
      // 删除末尾可能残留的带 imgurl 的链接（推荐阅读区域的小卡片）
      .replace(/(<a[^>]*imgurl="[^"]*"[^>]*>[\s\S]*?<\/a>\s*)+$/gi, '')
    
    return cleaned
  }

  const lang = language
  const brandName = contentData?.settings?.brandName?.[lang] || "锦秋基金"

  if (loading) {
    return (
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        padding: "40px 20px",
        textAlign: "center"
      }}>
        加载中...
      </div>
    )
  }

  if (error || !article) {
    return (
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <p style={{ color: "#666", marginBottom: "20px" }}>{error || "文章不存在"}</p>
        <Link href={`/library/${slug}`} style={{ color: "#225BBA" }}>
          ← 返回列表
        </Link>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      lineHeight: "1.8",
      color: "#333"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "16px", textDecoration: "none", flex: 1 }}>
          <img 
            src="/jinqiu-logo.png" 
            alt={brandName}
            style={{ height: "40px" }}
          />
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#000" }}>
            {brandName}
          </h1>
        </Link>
        <button 
          onClick={toggleLanguage}
          style={{
            background: "none",
            border: "1px solid #ccc",
            padding: "4px 12px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          {lang === "zh" ? "EN" : "中"}
        </button>
      </div>

      {/* Article Title */}
      <h2 style={{ 
        fontSize: "24px", 
        fontWeight: "bold", 
        marginBottom: "16px",
        lineHeight: "1.4",
        color: "#000"
      }}>
        {article.title}
      </h2>

      {/* Meta Info */}
      <div style={{ 
        fontSize: "14px", 
        color: "#666", 
        marginBottom: "24px",
        display: "flex",
        gap: "16px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <span>{article.publishDate}</span>
        <span>来源：{article.mpName}</span>
        {article.url && (
          <a 
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: "#225BBA", 
              textDecoration: "none"
            }}
          >
            查看原文
          </a>
        )}
      </div>

      {/* Article Content */}
      <div 
        className="wechat-article-content"
        style={{ 
          marginBottom: "40px",
          fontSize: "16px",
          lineHeight: "1.8",
          color: "#333"
        }}
        dangerouslySetInnerHTML={{ 
          __html: cleanHtml(article.content) || article.description || "暂无内容" 
        }}
      />
      <style jsx global>{`
        .wechat-article-content img {
          max-width: 100%;
          height: auto;
          margin: 16px 0;
          border-radius: 8px;
        }
        .wechat-article-content p {
          margin: 12px 0;
        }
        .wechat-article-content h1,
        .wechat-article-content h2,
        .wechat-article-content h3 {
          margin: 24px 0 12px;
          font-weight: bold;
        }
        .wechat-article-content a {
          color: #225BBA;
        }
        .wechat-article-content section {
          margin: 16px 0;
        }
        /* 推荐阅读区域的图片 */
        .wechat-article-content .recommend-link {
          display: block;
          margin: 8px 0;
        }
        .wechat-article-content .recommend-img {
          max-width: 400px !important;
          height: auto !important;
          margin: 6px 0 !important;
          border-radius: 6px !important;
        }
      `}</style>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Navigation */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <Link 
          href={`/library/${slug}`}
          style={{ color: "#225BBA", textDecoration: "none" }}
        >
          ← {lang === "zh" 
            ? `返回${currentItem?.name?.[lang] || "列表"}` 
            : `Back to ${currentItem?.name?.[lang] || "List"}`}
        </Link>
        <Link 
          href="/"
          style={{ color: "#225BBA", textDecoration: "none" }}
        >
          {lang === "zh" ? "返回首页" : "Back to Home"}
        </Link>
      </div>

      {/* Footer */}
      <div style={{ fontSize: "14px", color: "#666", marginTop: "60px" }}>
        <p>{lang === "zh" ? "© 2025 锦秋基金" : "© 2025 Jinqiu Capital"}</p>
      </div>
    </div>
  )
}

