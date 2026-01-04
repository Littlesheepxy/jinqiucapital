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

  // Convert HTML content to simple text/markdown display
  const renderContent = (html: string) => {
    if (!html) return null
    
    // 简单清理 HTML，保留基本格式
    const cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<img[^>]*>/gi, '') // 移除图片标签
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, '') // 移除所有其他标签
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n') // 压缩多余换行
      .trim()
    
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
        marginBottom: "32px",
        display: "flex",
        gap: "16px",
        alignItems: "center"
      }}>
        <span>{article.publishDate}</span>
        <span>来源：{article.mpName}</span>
      </div>

      {/* Article Content */}
      <div style={{ 
        marginBottom: "40px",
        whiteSpace: "pre-wrap",
        fontSize: "16px",
        lineHeight: "1.8"
      }}>
        {renderContent(article.content) || article.description || "暂无内容"}
      </div>

      {/* View Original Link */}
      {article.url && (
        <div style={{ marginBottom: "40px" }}>
          <a 
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: "#225BBA", 
              textDecoration: "none",
              fontSize: "14px"
            }}
          >
            📖 查看微信原文 →
          </a>
        </div>
      )}

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

