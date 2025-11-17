"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const articleSlug = params.articleSlug as string
  
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [contentData, setContentData] = useState<any>(null)
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [currentArticle, setCurrentArticle] = useState<any>(null)

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
        
        // Find the article with matching slug
        if (item && item.articles) {
          const article = item.articles.find((article: any) => article.slug === articleSlug)
          setCurrentArticle(article)
        }
      })
      .catch((err) => console.error("Failed to load data:", err))
  }, [slug, articleSlug])

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  if (!contentData || !currentItem || !currentArticle) {
    return <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
  }

  const lang = language
  const brandName = contentData.settings.brandName[lang]

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

      {/* Article Content */}
      <div 
        style={{ marginBottom: "40px" }}
        dangerouslySetInnerHTML={{ __html: currentArticle.content[lang] }}
      />

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Navigation */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <Link 
          href={`/library/${slug}`}
          style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
        >
          ← {lang === "zh" ? `返回${currentItem.name[lang]}` : `Back to ${currentItem.name[lang]}`}
        </Link>
        <Link 
          href="/"
          style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
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

