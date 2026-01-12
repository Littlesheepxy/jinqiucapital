import { useState, useCallback } from 'react'
import type { Video } from '../types'

interface UseVideosProps {
  password: string
}

interface UseVideosReturn {
  // 状态
  videos: Video[]
  videosLoading: boolean
  videosError: string | null
  editingVideo: Video | null
  videoCategoryFilter: string
  videoSearchQuery: string
  savingVideo: boolean
  saveVideoSuccess: boolean
  
  // 操作
  loadVideos: (overrideCategory?: string, overrideSearch?: string) => Promise<void>
  addVideo: (videoData: Partial<Video>) => Promise<void>
  updateVideo: (videoData: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>
  toggleVideoHidden: (id: string, currentHidden: boolean) => Promise<void>
  setEditingVideo: (video: Video | null) => void
  setVideoCategoryFilter: (filter: string) => void
  setVideoSearchQuery: (query: string) => void
}

export function useVideos({ password }: UseVideosProps): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [videosError, setVideosError] = useState<string | null>(null)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>("all")
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>("")
  const [savingVideo, setSavingVideo] = useState(false)
  const [saveVideoSuccess, setSaveVideoSuccess] = useState(false)

  // 加载视频列表
  const loadVideos = useCallback(async (overrideCategory?: string, overrideSearch?: string) => {
    try {
      setVideosLoading(true)
      setVideosError(null)
      
      const category = overrideCategory !== undefined ? overrideCategory : videoCategoryFilter
      const search = overrideSearch !== undefined ? overrideSearch : videoSearchQuery
      
      const params = new URLSearchParams()
      params.set("password", password)
      params.set("includeHidden", "true")
      if (category && category !== "all") {
        params.set("category", category)
      }
      if (search) {
        params.set("search", search)
      }
      
      const response = await fetch(`/api/admin/videos?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setVideos(data.data || [])
      } else {
        setVideosError(data.error || "加载视频失败")
      }
    } catch (error) {
      console.error("加载视频失败:", error)
      setVideosError("加载视频失败")
    } finally {
      setVideosLoading(false)
    }
  }, [password, videoCategoryFilter, videoSearchQuery])

  // 添加视频
  const addVideo = useCallback(async (videoData: Partial<Video>) => {
    try {
      setSavingVideo(true)
      setSaveVideoSuccess(false)
      
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          ...videoData,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSaveVideoSuccess(true)
        // 重新加载列表
        await loadVideos()
        setEditingVideo(null)
        setTimeout(() => setSaveVideoSuccess(false), 2000)
      } else {
        throw new Error(data.error || "添加视频失败")
      }
    } catch (error) {
      console.error("添加视频失败:", error)
      setVideosError(error instanceof Error ? error.message : "添加视频失败")
      throw error
    } finally {
      setSavingVideo(false)
    }
  }, [password, loadVideos])

  // 更新视频
  const updateVideo = useCallback(async (videoData: Partial<Video>) => {
    try {
      setSavingVideo(true)
      setSaveVideoSuccess(false)
      
      const response = await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          ...videoData,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSaveVideoSuccess(true)
        // 更新本地列表
        setVideos(prev => prev.map(v => v.id === videoData.id ? { ...v, ...data.data } : v))
        setEditingVideo(null)
        setTimeout(() => setSaveVideoSuccess(false), 2000)
      } else {
        throw new Error(data.error || "更新视频失败")
      }
    } catch (error) {
      console.error("更新视频失败:", error)
      setVideosError(error instanceof Error ? error.message : "更新视频失败")
      throw error
    } finally {
      setSavingVideo(false)
    }
  }, [password])

  // 删除视频
  const deleteVideo = useCallback(async (id: string) => {
    if (!confirm("确定要删除这个视频吗？")) return
    
    try {
      const response = await fetch("/api/admin/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setVideos(prev => prev.filter(v => v.id !== id))
      } else {
        throw new Error(data.error || "删除视频失败")
      }
    } catch (error) {
      console.error("删除视频失败:", error)
      setVideosError(error instanceof Error ? error.message : "删除视频失败")
    }
  }, [password])

  // 切换隐藏状态
  const toggleVideoHidden = useCallback(async (id: string, currentHidden: boolean) => {
    try {
      const response = await fetch("/api/admin/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id,
          hidden: !currentHidden,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setVideos(prev => prev.map(v => 
          v.id === id ? { ...v, hidden: !currentHidden } : v
        ))
      } else {
        throw new Error(data.error || "更新失败")
      }
    } catch (error) {
      console.error("更新视频状态失败:", error)
      setVideosError(error instanceof Error ? error.message : "更新失败")
    }
  }, [password])

  return {
    videos,
    videosLoading,
    videosError,
    editingVideo,
    videoCategoryFilter,
    videoSearchQuery,
    savingVideo,
    saveVideoSuccess,
    loadVideos,
    addVideo,
    updateVideo,
    deleteVideo,
    toggleVideoHidden,
    setEditingVideo,
    setVideoCategoryFilter,
    setVideoSearchQuery,
  }
}
