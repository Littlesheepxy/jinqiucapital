"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface WechatArticle {
  id: string
  title: string
  description: string
  url: string
  coverImage?: string
  publishDate: string
  publishTime: number
}

export default function LibraryItemPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [contentData, setContentData] = useState<any>(null)
  const [currentItem, setCurrentItem] = useState<any>(null)
  
  // 微信公众号文章
  const [wechatArticles, setWechatArticles] = useState<WechatArticle[]>([])
  const [wechatLoading, setWechatLoading] = useState(false)
  const [wechatError, setWechatError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const LIMIT = 10

  useEffect(() => {
    // Detect browser language
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.includes("en")) {
      setLanguage("en")
    }

    // Load content data
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContentData(data.content)
        // Find the item with matching slug
        const item = data.content.research.list.find((item: any) => item.slug === slug)
        setCurrentItem(item)
      })
      .catch((err) => console.error("Failed to load data:", err))

    // Load wechat articles for this category
    loadWechatArticles(0)
  }, [slug])

  const loadWechatArticles = async (newOffset: number, append = false) => {
    try {
      setWechatLoading(true)
      const response = await fetch(
        `/api/wechat/articles?category=${slug}&limit=${LIMIT}&offset=${newOffset}`
      )
      const data = await response.json()

      if (data.success) {
        if (append) {
          setWechatArticles(prev => [...prev, ...data.data.articles])
        } else {
          setWechatArticles(data.data.articles)
        }
        setHasMore(data.data.pagination.hasMore)
        setOffset(newOffset)
        setWechatError(null)
      } else {
        // 如果没有找到公众号，不显示错误，只是不显示微信文章
        if (!append) {
          setWechatArticles([])
        }
      }
    } catch (err) {
      console.error("Failed to load wechat articles:", err)
      if (!append) {
        setWechatArticles([])
      }
    } finally {
      setWechatLoading(false)
    }
  }

  const loadMore = () => {
    if (!wechatLoading && hasMore) {
      loadWechatArticles(offset + LIMIT, true)
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  if (!contentData || !currentItem) {
    return <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
  }

  const lang = language
  const brandName = contentData.settings.brandName[lang]

  // 判断是否有微信文章
  const hasWechatArticles = wechatArticles.length > 0

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      lineHeight: "1.6",
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

      {/* Page Title */}
      <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>
        {currentItem.name[lang]}
      </h2>

      {/* Intro Content */}
      {currentItem.intro && currentItem.intro[lang] && (
        <div 
          style={{ marginBottom: "32px", color: "#444" }}
          dangerouslySetInnerHTML={{ __html: currentItem.intro[lang] }}
        />
      )}

      {/* 微信公众号文章 */}
      {(hasWechatArticles || wechatLoading) && (
        <>
          {wechatLoading && wechatArticles.length === 0 ? (
            <p style={{ color: "#666" }}>{lang === "zh" ? "加载中..." : "Loading..."}</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {wechatArticles.map((article) => (
                  <article 
                    key={article.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "16px",
                    }}
                  >
                    <Link
                      href={`/library/${slug}/wechat/${article.id}`}
                      style={{ 
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                      }}
                    >
                      <h4 style={{ 
                        fontSize: "15px", 
                        fontWeight: "500", 
                        marginBottom: "4px",
                        color: "#225BBA",
                        lineHeight: "1.4"
                      }}>
                        {article.title}
                      </h4>
                      <p style={{ 
                        fontSize: "13px", 
                        color: "#666",
                        marginBottom: "4px",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {article.description}
                      </p>
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        {article.publishDate}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                  <button
                    onClick={loadMore}
                    disabled={wechatLoading}
                    style={{
                      padding: "10px 24px",
                      fontSize: "14px",
                      color: "#225BBA",
                      background: "transparent",
                      border: "1px solid #225BBA",
                      borderRadius: "4px",
                      cursor: wechatLoading ? "not-allowed" : "pointer",
                      opacity: wechatLoading ? 0.6 : 1,
                    }}
                  >
                    {wechatLoading 
                      ? (lang === "zh" ? "加载中..." : "Loading...")
                      : (lang === "zh" ? "加载更多" : "Load More")}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 如果没有任何文章 */}
      {!hasWechatArticles && !wechatLoading && (
        <p style={{ color: "#666", marginTop: "20px" }}>
          {lang === "zh" ? "暂无文章，敬请期待..." : "No articles yet, stay tuned..."}
        </p>
      )}

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Back to Home */}
      <p>
        <Link 
          href="/"
          style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
        >
          ← {lang === "zh" ? "返回首页" : "Back to Home"}
        </Link>
      </p>

      {/* Footer */}
      <div style={{ fontSize: "14px", color: "#666", marginTop: "60px" }}>
        <p>{lang === "zh" ? "© 2025 锦秋基金" : "© 2025 Jinqiu Capital"}</p>
      </div>
    </div>
  )
}
