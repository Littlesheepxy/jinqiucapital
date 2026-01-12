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

interface Video {
  id: string
  title: string
  description: string
  bvid: string
  tags: string[]
  coverImage: string | null
  sortOrder: number
  createdAt: string
}

// 视频卡片组件
function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  const [coverLoaded, setCoverLoaded] = useState(false)
  const [coverError, setCoverError] = useState(false)
  
  // 封面图优先使用后端返回的，否则使用占位图
  const coverUrl = video.coverImage || "/placeholder.jpg"
  
  return (
    <div 
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <div style={{
        position: "relative",
        paddingTop: "56.25%",
        backgroundColor: "#e9ecef",
      }}>
        <img 
          src={coverError ? "/placeholder.jpg" : coverUrl}
          alt={video.title}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: coverLoaded ? 1 : 0,
            transition: "opacity 0.3s",
          }}
          onLoad={() => setCoverLoaded(true)}
          onError={() => {
            setCoverError(true)
            setCoverLoaded(true)
          }}
        />
        {!coverLoaded && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: "14px",
          }}>
            加载中...
          </div>
        )}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "48px",
          height: "48px",
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "white", fontSize: "20px", marginLeft: "3px" }}>▶</span>
        </div>
        <div style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          backgroundColor: "#00a1d6",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "bold",
        }}>
          B站
        </div>
      </div>
      
      <div style={{ padding: "12px" }}>
        <h3 style={{
          fontSize: "14px",
          fontWeight: "600",
          margin: "0 0 8px 0",
          lineHeight: "1.4",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          color: "#333",
        }}>
          {video.title}
        </h3>
        
        {video.tags && video.tags.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {video.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} style={{
                padding: "2px 6px",
                backgroundColor: "#e9ecef",
                color: "#666",
                borderRadius: "4px",
                fontSize: "11px",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 视频播放弹窗
function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#000",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "900px",
          overflow: "hidden",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
          }}
        >
          ×
        </button>

        <div style={{
          position: "relative",
          paddingTop: "56.25%",
          backgroundColor: "#000",
        }}>
          <iframe
            src={`//player.bilibili.com/player.html?bvid=${video.bvid}&high_quality=1&autoplay=1`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allowFullScreen
            allow="autoplay"
          />
        </div>

        <div style={{ padding: "20px", backgroundColor: "#111", color: "white" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 12px 0" }}>
            {video.title}
          </h2>
          
          {video.tags && video.tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
              {video.tags.map((tag, idx) => (
                <span key={idx} style={{
                  padding: "4px 10px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#aaa",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {video.description && (
            <p style={{ fontSize: "14px", color: "#999", margin: "0 0 16px 0", lineHeight: "1.6" }}>
              {video.description}
            </p>
          )}
          
          <a
            href={`https://www.bilibili.com/video/${video.bvid}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#00a1d6",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            🔗 在B站观看
          </a>
        </div>
      </div>
    </div>
  )
}

export default function LibraryItemPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [contentData, setContentData] = useState<any>(null)
  const [currentItem, setCurrentItem] = useState<any>(null)
  
  // 微信公众号文章（用于文章类型项目）
  const [wechatArticles, setWechatArticles] = useState<WechatArticle[]>([])
  const [wechatLoading, setWechatLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const LIMIT = 10

  // 视频（用于视频类型项目）
  const [videos, setVideos] = useState<Video[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosHasMore, setVideosHasMore] = useState(false)
  const [videosOffset, setVideosOffset] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const VIDEOS_LIMIT = 12

  // 判断是否是视频类型的项目（根据项目的 type 字段）
  const isVideoType = currentItem?.type === "video"

  useEffect(() => {
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.includes("en")) {
      setLanguage("en")
    }

    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContentData(data.content)
        const item = data.content.research.list.find((item: any) => item.slug === slug)
        setCurrentItem(item)
      })
      .catch((err) => console.error("Failed to load data:", err))

    // 微信文章总是尝试加载（图文类型）
    loadWechatArticles(0)
  }, [slug])

  // 当确定是视频类型后，加载视频
  useEffect(() => {
    if (isVideoType) {
      loadVideos(0)
    }
  }, [isVideoType])

  // 加载微信文章
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
      } else {
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

  // 加载视频
  const loadVideos = async (newOffset: number, append = false) => {
    try {
      if (!append) setVideosLoading(true)
      
      const params = new URLSearchParams()
      params.set("limit", VIDEOS_LIMIT.toString())
      params.set("offset", newOffset.toString())
      
      const response = await fetch(`/api/videos?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        if (append) {
          setVideos(prev => [...prev, ...data.data.videos])
        } else {
          setVideos(data.data.videos)
        }
        setVideosHasMore(data.data.pagination.hasMore)
        setVideosOffset(newOffset)
      }
    } catch (err) {
      console.error("加载视频失败:", err)
    } finally {
      setVideosLoading(false)
    }
  }

  const loadMoreArticles = () => {
    if (!wechatLoading && hasMore) {
      loadWechatArticles(offset + LIMIT, true)
    }
  }

  const loadMoreVideos = () => {
    if (!videosLoading && videosHasMore) {
      loadVideos(videosOffset + VIDEOS_LIMIT, true)
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
  const hasWechatArticles = wechatArticles.length > 0

  // 获取所有视频标签
  const allTags = Array.from(new Set(videos.flatMap(v => v.tags || [])))
  
  // 筛选视频
  const filteredVideos = selectedTag 
    ? videos.filter(v => v.tags?.includes(selectedTag))
    : videos

  return (
    <div style={{ 
      maxWidth: isVideoType ? "1000px" : "800px", 
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
        {isVideoType ? "📹 " : ""}{currentItem.name[lang]}
      </h2>

      {/* Intro Content */}
      {currentItem.intro && currentItem.intro[lang] && (
        <div 
          style={{ marginBottom: "32px", color: "#444" }}
          dangerouslySetInnerHTML={{ __html: currentItem.intro[lang] }}
        />
      )}

      {/* 视频类型项目 - 显示视频网格 */}
      {isVideoType && (
        <>
          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div style={{ marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  padding: "6px 14px",
                  backgroundColor: selectedTag === null ? "#225BBA" : "#f0f0f0",
                  color: selectedTag === null ? "white" : "#666",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {lang === "zh" ? "全部" : "All"}
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: selectedTag === tag ? "#225BBA" : "#f0f0f0",
                    color: selectedTag === tag ? "white" : "#666",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* 加载中 */}
          {videosLoading && videos.length === 0 && (
            <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>
              {lang === "zh" ? "加载中..." : "Loading..."}
            </div>
          )}

          {/* 视频网格 */}
          {filteredVideos.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}>
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              ))}
            </div>
          )}

          {/* 加载更多 */}
          {videosHasMore && !selectedTag && (
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <button
                onClick={loadMoreVideos}
                disabled={videosLoading}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: videosLoading ? "not-allowed" : "pointer",
                  opacity: videosLoading ? 0.6 : 1,
                  fontSize: "14px",
                }}
              >
                {videosLoading 
                  ? (lang === "zh" ? "加载中..." : "Loading...") 
                  : (lang === "zh" ? "加载更多" : "Load More")}
              </button>
            </div>
          )}

          {/* 无视频 */}
          {!videosLoading && videos.length === 0 && (
            <div style={{ padding: "60px", textAlign: "center", color: "#999" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
              <p>{lang === "zh" ? "暂无视频，敬请期待..." : "No videos yet, stay tuned..."}</p>
            </div>
          )}
        </>
      )}

      {/* 文章类型项目 - 显示微信文章列表 */}
      {!isVideoType && (
        <>
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

                  {hasMore && (
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                      <button
                        onClick={loadMoreArticles}
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

          {!hasWechatArticles && !wechatLoading && (
            <p style={{ color: "#666", marginTop: "20px" }}>
              {lang === "zh" ? "暂无文章，敬请期待..." : "No articles yet, stay tuned..."}
            </p>
          )}
        </>
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

      {/* 视频播放弹窗 */}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  )
}
