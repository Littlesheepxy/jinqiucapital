"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ArticleData {
  id: string
  title: string
  content: string
  description?: string
  url: string
  coverImage?: string
  publishDate: string
  mpName: string
}

export default function WechatArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const id = params.id as string
  
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Detect browser language
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.includes("en")) {
      setLanguage("en")
    }

    // Load article detail
    loadArticle()
  }, [id])

  const loadArticle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/wechat/articles/${id}`)
      const data = await response.json()

      if (data.success) {
        setArticle(data.data)
        setError(null)
      } else {
        setError(data.error || "文章加载失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  const lang = language
  const brandName = lang === "zh" ? "锦秋基金" : "Jinqiu Capital"

  // 将 HTML 内容转换为更简洁的格式显示
  const formatContent = (html: string) => {
    if (!html) return ""
    
    // 简单清理 HTML，保留基本格式
    let content = html
      // 移除 script 和 style 标签
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // 保留段落、标题、列表等基本结构
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      // 移除其他 HTML 标签但保留内容
      .replace(/<[^>]+>/g, "")
      // 清理多余空行
      .replace(/\n{3,}/g, "\n\n")
      .trim()
    
    return content
  }

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      lineHeight: "1.8",
      color: "#000"
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

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>
          {lang === "zh" ? "加载中..." : "Loading..."}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ 
          padding: "20px", 
          background: "#fee", 
          border: "1px solid #fcc",
          borderRadius: "8px",
          color: "#c00"
        }}>
          {error}
        </div>
      )}

      {/* Article Content */}
      {article && !loading && (
        <>
          {/* Article Header */}
          <article>
            <h1 style={{ 
              fontSize: "28px", 
              fontWeight: "bold", 
              marginBottom: "16px",
              lineHeight: "1.4"
            }}>
              {article.title}
            </h1>

            <div style={{ 
              display: "flex", 
              gap: "16px", 
              color: "#666", 
              fontSize: "14px",
              marginBottom: "32px",
              paddingBottom: "16px",
              borderBottom: "1px solid #eee"
            }}>
              <span>{article.publishDate}</span>
              <span>•</span>
              <span>{article.mpName}</span>
              <span style={{ marginLeft: "auto" }}>
                <a 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#225BBA", textDecoration: "none" }}
                >
                  {lang === "zh" ? "查看原文 →" : "View Original →"}
                </a>
              </span>
            </div>

            {/* Cover Image */}
            {article.coverImage && (
              <div style={{ marginBottom: "32px" }}>
                <img 
                  src={article.coverImage}
                  alt={article.title}
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            )}

            {/* Article Body */}
            <div style={{ 
              fontSize: "16px",
              lineHeight: "1.8",
              color: "#333",
              whiteSpace: "pre-wrap",
            }}>
              {formatContent(article.content)}
            </div>
          </article>

          <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

          {/* Back Link */}
          <p>
            <Link 
              href={`/library/${slug}`}
              style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
            >
              ← {lang === "zh" ? "返回列表" : "Back to List"}
            </Link>
          </p>
        </>
      )}

      {/* Footer */}
      <div style={{ fontSize: "14px", color: "#666", marginTop: "60px" }}>
        <p>{lang === "zh" ? "© 2025 锦秋基金" : "© 2025 Jinqiu Capital"}</p>
      </div>
    </div>
  )
}

