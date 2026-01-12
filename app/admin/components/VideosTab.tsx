"use client"

import { useState, useRef } from "react"
import { useAdmin } from "../context/AdminContext"
import type { Video } from "../types"

// 封面图上传组件
function CoverImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { state } = useAdmin()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("请上传 JPG、PNG、WebP 或 GIF 格式的图片")
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB")
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("password", state.password)
      formData.append("folder", "video-covers")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        onChange(data.data.url)
      } else {
        setError(data.error || "上传失败")
      }
    } catch (err) {
      console.error("上传失败:", err)
      setError("上传失败，请重试")
    } finally {
      setUploading(false)
      // 清空 input，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
        封面图（可选）
      </label>
      
      {/* 预览 */}
      {value && (
        <div style={{ 
          marginBottom: "12px", 
          position: "relative",
          width: "200px",
        }}>
          <img
            src={value}
            alt="封面预览"
            style={{
              width: "200px",
              height: "112px",
              objectFit: "cover",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 上传区域 */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: uploading ? "not-allowed" : "pointer",
            fontSize: "14px",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "上传中..." : "📷 上传图片"}
        </button>
        <span style={{ color: "#666", fontSize: "12px" }}>
          或
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入图片 URL"
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* 提示信息 */}
      <p style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
        💡 推荐尺寸: 1280×720 (16:9)，最大 5MB，支持 JPG/PNG/WebP/GIF
      </p>
      <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
        留空则自动使用 B站视频封面
      </p>

      {/* 错误提示 */}
      {error && (
        <p style={{ fontSize: "12px", color: "#dc3545", marginTop: "6px" }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}

// 视频卡片组件
function VideoCard({ 
  video, 
  onEdit, 
  onDelete, 
  onToggleHidden 
}: { 
  video: Video
  onEdit: () => void
  onDelete: () => void
  onToggleHidden: () => void
}) {
  
  // B站封面图
  const coverUrl = video.cover_image || `https://i0.hdslb.com/bfs/archive/${video.bvid}@320w_200h.jpg`
  
  return (
    <div style={{
      display: "flex",
      gap: "16px",
      padding: "16px",
      border: "1px solid #e5e5e5",
      borderRadius: "8px",
      backgroundColor: video.hidden ? "#f9f9f9" : "white",
      opacity: video.hidden ? 0.7 : 1,
    }}>
      {/* 封面图 */}
      <div style={{
        width: "160px",
        height: "100px",
        flexShrink: 0,
        borderRadius: "4px",
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
        position: "relative",
      }}>
        <img 
          src={coverUrl}
          alt={video.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.jpg"
          }}
        />
        {/* 播放按钮 */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "40px",
          height: "40px",
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "white", fontSize: "16px", marginLeft: "2px" }}>▶</span>
        </div>
      </div>
      
      {/* 视频信息 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "600",
            margin: 0,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {video.hidden && <span style={{ color: "#999" }}>[已隐藏] </span>}
            {video.title}
          </h3>
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "8px",
          flexWrap: "wrap",
        }}>
          {video.tags?.map((tag, idx) => (
            <span key={idx} style={{
              padding: "2px 8px",
              backgroundColor: "#e8f4fd",
              color: "#225BBA",
              borderRadius: "4px",
              fontSize: "12px",
            }}>
              #{tag}
            </span>
          ))}
        </div>
        
        {video.description && (
          <p style={{
            fontSize: "13px",
            color: "#666",
            margin: "0 0 8px 0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {video.description}
          </p>
        )}
        
        <div style={{ 
          display: "flex", 
          gap: "8px",
          alignItems: "center",
          fontSize: "12px",
          color: "#999",
        }}>
          <span>BV: {video.bvid}</span>
          <span>·</span>
          <a 
            href={`https://www.bilibili.com/video/${video.bvid}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00a1d6" }}
          >
            在B站观看 ↗
          </a>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "8px",
        flexShrink: 0,
      }}>
        <button
          onClick={onEdit}
          style={{
            padding: "6px 12px",
            backgroundColor: "#225BBA",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          编辑
        </button>
        <button
          onClick={onToggleHidden}
          style={{
            padding: "6px 12px",
            backgroundColor: video.hidden ? "#28a745" : "#ffc107",
            color: video.hidden ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          {video.hidden ? "显示" : "隐藏"}
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: "6px 12px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          删除
        </button>
      </div>
    </div>
  )
}

// 视频表单数据类型（包含 bilibiliUrl 和 coverImage）
interface VideoFormData extends Partial<Video> {
  bilibiliUrl?: string
  coverImage?: string | null  // API 期望的 camelCase 格式
}

// 视频编辑弹窗
function VideoEditModal({
  video,
  isNew,
  saving,
  onClose,
  onSave,
}: {
  video: Partial<Video> | null
  isNew: boolean
  saving: boolean
  onClose: () => void
  onSave: (data: VideoFormData) => void
}) {
  const [formData, setFormData] = useState<Partial<Video>>({
    title: video?.title || "",
    bvid: video?.bvid || "",
    tags: video?.tags || [],
    description: video?.description || "",
    cover_image: video?.cover_image || "",
    ...video,
  })
  const [tagsInput, setTagsInput] = useState(video?.tags?.join(", ") || "")
  const [bilibiliUrl, setBilibiliUrl] = useState(
    video?.bvid ? `https://www.bilibili.com/video/${video.bvid}` : ""
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 处理标签
    const tags = tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
    
    // 转换字段名为 API 期望的格式
    const { cover_image, ...rest } = formData
    
    onSave({
      ...rest,
      tags,
      coverImage: cover_image || null, // API 期望 camelCase
      bilibiliUrl, // API 会从中提取 bvid
    })
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflow: "auto",
      }}>
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>
            {isNew ? "添加视频" : "编辑视频"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {/* B站链接 */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              B站视频链接 *
            </label>
            <input
              type="text"
              value={bilibiliUrl}
              onChange={(e) => setBilibiliUrl(e.target.value)}
              placeholder="https://www.bilibili.com/video/BV..."
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              支持格式: bilibili.com/video/BVxxx 或 b23.tv/xxx 或直接输入 BV 号
            </p>
          </div>
          
          {/* 标题 */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              视频标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入视频标题"
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          
          {/* 标签 */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, 访谈, 创业"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          
          {/* 简介 */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              视频简介
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="输入视频简介..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
          </div>
          
          {/* 自定义封面 */}
          <CoverImageUpload
            value={formData.cover_image || ""}
            onChange={(url) => setFormData({ ...formData, cover_image: url || null })}
          />
          
          {/* 按钮 */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 20px",
                backgroundColor: "#225BBA",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "14px",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 主组件
export function VideosTab() {
  const { state, actions } = useAdmin()
  const {
    videos,
    videosLoading,
    videosError,
    editingVideo,
    videoSearchQuery,
    savingVideo,
  } = state
  const {
    loadVideos,
    addVideo,
    updateVideo,
    deleteVideo,
    toggleVideoHidden,
    setEditingVideo,
    setVideoSearchQuery,
  } = actions

  const [showAddModal, setShowAddModal] = useState(false)

  const handleSave = async (data: Partial<Video>) => {
    try {
      if (editingVideo?.id) {
        await updateVideo({ ...data, id: editingVideo.id })
      } else {
        await addVideo(data)
      }
      setShowAddModal(false)
      setEditingVideo(null)
    } catch (error) {
      // 错误已在 hook 中处理
    }
  }

  return (
    <>
      <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
        {/* 标题栏 */}
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>📹 视频管理</h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => loadVideos()}
              disabled={videosLoading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: videosLoading ? "not-allowed" : "pointer",
                opacity: videosLoading ? 0.6 : 1,
              }}
            >
              {videosLoading ? "加载中..." : "刷新"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#225BBA",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              + 添加视频
            </button>
          </div>
        </div>

        {/* 搜索 */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <input
            type="text"
            value={videoSearchQuery}
            onChange={(e) => setVideoSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadVideos()
              }
            }}
            placeholder="搜索视频标题或标签..."
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              width: "250px",
            }}
          />
          
          <button
            onClick={() => loadVideos()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            搜索
          </button>
          
          {videoSearchQuery && (
            <button
              onClick={() => {
                setVideoSearchQuery("")
                loadVideos("all", "")
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              重置
            </button>
          )}
          
          <span style={{ color: "#666", fontSize: "14px" }}>
            共 {videos.length} 个视频
          </span>
        </div>

        {/* 错误提示 */}
        {videosError && (
          <div style={{
            padding: "12px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "20px",
          }}>
            ❌ {videosError}
          </div>
        )}

        {/* 加载状态 */}
        {videosLoading && (
          <div style={{
            padding: "40px",
            textAlign: "center",
            color: "#666",
          }}>
            加载中...
          </div>
        )}

        {/* 视频列表 */}
        {!videosLoading && videos.length > 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            {videos.map((video: Video) => (
              <VideoCard
                key={video.id}
                video={video}
                onEdit={() => setEditingVideo(video)}
                onDelete={() => deleteVideo(video.id)}
                onToggleHidden={() => toggleVideoHidden(video.id, video.hidden)}
              />
            ))}
          </div>
        )}

        {/* 无视频提示 */}
        {!videosLoading && videos.length === 0 && !videosError && (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#999",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
            <p>暂无视频</p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                backgroundColor: "#225BBA",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              添加第一个视频
            </button>
          </div>
        )}
      </div>

      {/* 添加/编辑弹窗 */}
      {(showAddModal || editingVideo) && (
        <VideoEditModal
          video={editingVideo}
          isNew={!editingVideo}
          saving={savingVideo}
          onClose={() => {
            setShowAddModal(false)
            setEditingVideo(null)
          }}
          onSave={handleSave}
        />
      )}
    </>
  )
}
