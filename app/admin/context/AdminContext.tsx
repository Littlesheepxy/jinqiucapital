"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { useDebouncedCallback } from "use-debounce"
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useAdminData } from "../hooks/useAdminData"
import { useWechatArticles } from "../hooks/useWechatArticles"
import { useContentOperations } from "../hooks/useContentOperations"
import { usePreview } from "../hooks/usePreview"
import { useVideos } from "../hooks/useVideos"
import type { AdminState, AdminActions, AdminTab } from "../types"

interface AdminContextType {
  state: AdminState
  actions: AdminActions
  sensors: ReturnType<typeof useSensors>
  hasUnsavedChanges: React.MutableRefObject<boolean>
}

const AdminContext = createContext<AdminContextType | null>(null)

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}

interface AdminProviderProps {
  children: ReactNode
}

export function AdminProvider({ children }: AdminProviderProps) {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState<AdminTab>("intro")
  
  // UI 状态
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  // 使用拆分后的 hooks
  const adminData = useAdminData()
  const { contentData, setContentData, teamData, setTeamData, message, setMessage, hasUnsavedChanges } = adminData
  
  const wechatArticles = useWechatArticles(password, setMessage)
  const videos = useVideos({ password })
  const preview = usePreview(contentData)

  // 标记有未保存的更改
  const markAsChanged = useCallback(() => {
    hasUnsavedChanges.current = true
    adminData.saveLocalDraft()
    debouncedAutoSave()
  }, [adminData.saveLocalDraft])

  const contentOps = useContentOperations({
    contentData,
    setContentData,
    teamData,
    setTeamData,
    markAsChanged,
    hasUnsavedChanges,
  })

  // 拖拽排序传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 页面离开前警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault()
        e.returnValue = '您有未保存到服务器的更改，确定要离开吗？'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // 当切换到微信文章标签时，加载文章列表
  useEffect(() => {
    if (activeTab === "wechat-articles" && password && wechatArticles.wechatArticles.length === 0) {
      wechatArticles.loadWechatArticles()
    }
  }, [activeTab, password])

  // 当切换到视频标签时，加载视频列表
  useEffect(() => {
    if (activeTab === "videos" && password && videos.videos.length === 0) {
      videos.loadVideos()
    }
  }, [activeTab, password])

  // 自动保存
  const debouncedAutoSave = useDebouncedCallback(
    () => {
      if (hasUnsavedChanges.current) {
        adminData.performSave(password, true)
      }
    },
    2000
  )

  // 手动保存
  const handleSave = () => {
    adminData.performSave(password, false)
  }

  // 登录处理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, content: null, team: null })
      })

      if (response.ok) {
        setIsAuthenticated(true)
        
        const hasDraft = adminData.checkForLocalDraft()
        
        if (hasDraft) {
          const useDraft = confirm(
            '🔔 检测到本地有未保存的编辑内容！\n\n' +
            '✅ 点击"确定"恢复本地编辑内容\n' +
            '❌ 点击"取消"加载服务器最新数据（本地编辑将丢失）'
          )
          
          if (useDraft) {
            adminData.loadLocalDraft()
            setMessage('✓ 已恢复本地编辑内容，请记得保存到服务器！')
            setTimeout(() => setMessage(''), 5000)
          } else {
            adminData.clearLocalDraft()
            adminData.loadData()
          }
        } else {
          adminData.loadData()
        }
        
        setShowWelcomeModal(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        setMessage("密码错误")
      }
    } catch (error) {
      setMessage("验证失败")
    }
  }

  // 组装状态
  const state: AdminState = {
    isAuthenticated,
    password,
    contentData,
    teamData,
    activeTab,
    saving: adminData.saving,
    message,
    activeResearchIndex: contentOps.activeResearchIndex,
    expandedArticles: contentOps.expandedArticles,
    showPreview: preview.showPreview,
    previewContent: preview.previewContent,
    previewLanguage: preview.previewLanguage,
    previewType: preview.previewType,
    previewResearchIndex: preview.previewResearchIndex,
    previewArticleIndex: preview.previewArticleIndex,
    showWelcomeModal,
    showConfetti,
    autoSaving: adminData.autoSaving,
    lastSaved: adminData.lastSaved,
    showVersionHistory,
    versionHistory: adminData.versionHistory,
    selectedVersion,
    wechatArticles: wechatArticles.wechatArticles,
    wechatLoading: wechatArticles.wechatLoading,
    wechatError: wechatArticles.wechatError,
    editingArticle: wechatArticles.editingArticle,
    wechatCategoryFilter: wechatArticles.wechatCategoryFilter,
    wechatSearchQuery: wechatArticles.wechatSearchQuery,
    savingArticle: wechatArticles.savingArticle,
    saveArticleSuccess: wechatArticles.saveArticleSuccess,
    // 视频
    videos: videos.videos,
    videosLoading: videos.videosLoading,
    videosError: videos.videosError,
    editingVideo: videos.editingVideo,
    videoCategoryFilter: videos.videoCategoryFilter,
    videoSearchQuery: videos.videoSearchQuery,
    savingVideo: videos.savingVideo,
    saveVideoSuccess: videos.saveVideoSuccess,
  }

  // 组装操作
  const actions: AdminActions = {
    loadData: adminData.loadData,
    handleSave,
    markAsChanged,
    // 团队
    addTeamMember: contentOps.addTeamMember,
    removeTeamMember: contentOps.removeTeamMember,
    updateTeamMember: contentOps.updateTeamMember,
    // 投资组合
    addPortfolioItem: contentOps.addPortfolioItem,
    removePortfolioItem: contentOps.removePortfolioItem,
    updatePortfolioItem: contentOps.updatePortfolioItem,
    addPortfolioFounder: contentOps.addPortfolioFounder,
    removePortfolioFounder: contentOps.removePortfolioFounder,
    updatePortfolioFounder: contentOps.updatePortfolioFounder,
    // 项目
    addProject: contentOps.addProject,
    removeProject: contentOps.removeProject,
    updateProject: contentOps.updateProject,
    // 研究
    addResearch: contentOps.addResearch,
    removeResearch: contentOps.removeResearch,
    updateResearch: contentOps.updateResearch,
    addArticle: contentOps.addArticle,
    removeArticle: contentOps.removeArticle,
    updateArticle: contentOps.updateArticle,
    toggleArticleExpand: contentOps.toggleArticleExpand,
    isArticleExpanded: contentOps.isArticleExpanded,
    handleResearchDragEnd: contentOps.handleResearchDragEnd,
    toggleResearchHidden: contentOps.toggleResearchHidden,
    // 版本历史
    restoreVersion: (timestamp: number) => adminData.restoreVersion(timestamp, markAsChanged, setShowVersionHistory),
    deleteVersion: adminData.deleteVersion,
    clearAllVersions: adminData.clearAllVersions,
    // 微信文章
    loadWechatArticles: wechatArticles.loadWechatArticles,
    saveWechatArticle: wechatArticles.saveWechatArticle,
    deleteWechatArticle: wechatArticles.deleteWechatArticle,
    toggleWechatArticleHidden: wechatArticles.toggleWechatArticleHidden,
    // 预览
    updatePreview: preview.updatePreview,
    openPreviewInNewTab: preview.openPreviewInNewTab,
    // 状态更新
    setContentData: setContentData as any,
    setTeamData,
    setActiveTab,
    setMessage,
    setActiveResearchIndex: contentOps.setActiveResearchIndex,
    setShowPreview: preview.setShowPreview,
    setPreviewLanguage: preview.setPreviewLanguage,
    setShowWelcomeModal,
    setShowVersionHistory,
    setEditingArticle: wechatArticles.setEditingArticle,
    setWechatCategoryFilter: wechatArticles.setWechatCategoryFilter,
    setWechatSearchQuery: wechatArticles.setWechatSearchQuery,
    // 视频
    loadVideos: videos.loadVideos,
    addVideo: videos.addVideo,
    updateVideo: videos.updateVideo,
    deleteVideo: videos.deleteVideo,
    toggleVideoHidden: videos.toggleVideoHidden,
    setEditingVideo: videos.setEditingVideo,
    setVideoCategoryFilter: videos.setVideoCategoryFilter,
    setVideoSearchQuery: videos.setVideoSearchQuery,
  }

  const contextValue: AdminContextType & {
    handleLogin: (e: React.FormEvent) => Promise<void>
    setPassword: (p: string) => void
  } = {
    state,
    actions,
    sensors,
    hasUnsavedChanges,
    handleLogin,
    setPassword,
  }

  return (
    <AdminContext.Provider value={contextValue as any}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminLogin() {
  const context = useContext(AdminContext) as any
  if (!context) {
    throw new Error("useAdminLogin must be used within AdminProvider")
  }
  return {
    handleLogin: context.handleLogin,
    setPassword: context.setPassword,
    password: context.state.password,
    message: context.state.message,
    isAuthenticated: context.state.isAuthenticated,
  }
}
