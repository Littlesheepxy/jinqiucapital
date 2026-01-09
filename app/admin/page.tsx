"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { RichTextEditor } from "@/components/rich-text-editor"
import Confetti from "react-confetti"
import { useDebouncedCallback } from "use-debounce"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem, VisibilityToggle } from "@/components/sortable-item"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [contentData, setContentData] = useState<any>(null)
  const [teamData, setTeamData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"intro" | "team" | "portfolio" | "projects" | "research" | "wechat-articles">("intro")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [activeResearchIndex, setActiveResearchIndex] = useState(0)
  const [expandedArticles, setExpandedArticles] = useState<{[key: string]: boolean}>({})
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewLanguage, setPreviewLanguage] = useState<"zh" | "en">("zh")
  const [previewType, setPreviewType] = useState<"intro" | "research-intro" | "research-article">("intro")
  const [previewResearchIndex, setPreviewResearchIndex] = useState(0)
  const [previewArticleIndex, setPreviewArticleIndex] = useState(0)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const hasUnsavedChanges = useRef(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versionHistory, setVersionHistory] = useState<Array<{
    timestamp: number
    content: any
    team: any[]
    description: string
  }>>([])
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  // 微信文章管理状态
  const [wechatArticles, setWechatArticles] = useState<any[]>([])
  const [wechatLoading, setWechatLoading] = useState(false)
  const [wechatError, setWechatError] = useState<string | null>(null)
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [wechatCategoryFilter, setWechatCategoryFilter] = useState<string>("all")
  const [wechatSearchQuery, setWechatSearchQuery] = useState<string>("")
  const [savingArticle, setSavingArticle] = useState(false)
  const [saveArticleSuccess, setSaveArticleSuccess] = useState(false)

  // 拖拽排序传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 研究栏目拖拽排序
  const handleResearchDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = contentData.research.list.findIndex((item: any) => 
        (item.slug || `item-${contentData.research.list.indexOf(item)}`) === active.id
      )
      const newIndex = contentData.research.list.findIndex((item: any) => 
        (item.slug || `item-${contentData.research.list.indexOf(item)}`) === over.id
      )
      
      const newList = arrayMove(contentData.research.list, oldIndex, newIndex)
      setContentData({
        ...contentData,
        research: { ...contentData.research, list: newList }
      })
      hasUnsavedChanges.current = true
      
      // 更新选中索引
      if (activeResearchIndex === oldIndex) {
        setActiveResearchIndex(newIndex)
      } else if (activeResearchIndex > oldIndex && activeResearchIndex <= newIndex) {
        setActiveResearchIndex(activeResearchIndex - 1)
      } else if (activeResearchIndex < oldIndex && activeResearchIndex >= newIndex) {
        setActiveResearchIndex(activeResearchIndex + 1)
      }
    }
  }

  // 切换研究栏目隐藏状态
  const toggleResearchHidden = (index: number) => {
    const newList = [...contentData.research.list]
    newList[index] = {
      ...newList[index],
      hidden: !newList[index].hidden
    }
    setContentData({
      ...contentData,
      research: { ...contentData.research, list: newList }
    })
    hasUnsavedChanges.current = true
  }

  // 切换微信文章隐藏状态
  const toggleWechatArticleHidden = async (id: string, currentHidden: boolean) => {
    try {
      const response = await fetch("/api/admin/wechat-articles", {
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
        setMessage(`✓ 文章已${currentHidden ? "显示" : "隐藏"}`)
        loadWechatArticles()
      } else {
        setMessage(`操作失败: ${data.error}`)
      }
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Failed to toggle article visibility:", error)
      setMessage("操作失败")
      setTimeout(() => setMessage(""), 3000)
    }
  }

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
    if (activeTab === "wechat-articles" && password && wechatArticles.length === 0) {
      loadWechatArticles()
    }
  }, [activeTab, password])

  // 加载数据
  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/content")
      const data = await response.json()
      setContentData(data.content)
      setTeamData(data.team)
      
      // 加载版本历史
      loadVersionHistory()
    } catch (error) {
      setMessage("加载数据失败")
    }
  }

  // 从 Supabase 加载版本历史
  const loadVersionHistory = async () => {
    try {
      const response = await fetch('/api/admin/versions?type=content&limit=50')
      if (response.ok) {
        const data = await response.json()
        // 转换 Supabase 版本格式为本地格式
        const history = data.versions.map((v: any) => ({
          timestamp: new Date(v.created_at).getTime(),
          content: v.data_type === 'content' ? v.data : null,
          team: v.data_type === 'team' ? v.data : null,
          description: v.description || `版本 ${v.version}`,
          version: v.version,
          id: v.id,
        }))
        setVersionHistory(history)
      } else {
        // 如果 Supabase 未配置，从 localStorage 加载
        const saved = localStorage.getItem('jinqiu_version_history')
        if (saved) {
          const history = JSON.parse(saved)
          setVersionHistory(history)
        }
      }
    } catch (error) {
      console.error('Failed to load version history:', error)
      // 降级到 localStorage
      try {
        const saved = localStorage.getItem('jinqiu_version_history')
        if (saved) {
          const history = JSON.parse(saved)
          setVersionHistory(history)
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e)
      }
    }
  }

  // 检查本地草稿
  const checkForLocalDraft = () => {
    try {
      const draft = localStorage.getItem('jinqiu_local_draft')
      if (draft) {
        const draftData = JSON.parse(draft)
        // 检查草稿是否在30分钟内
        const draftAge = Date.now() - draftData.timestamp
        return draftAge < 30 * 60 * 1000 // 30分钟
      }
    } catch (error) {
      console.error('Failed to check local draft:', error)
    }
    return false
  }

  // 加载本地草稿
  const loadLocalDraft = () => {
    try {
      const draft = localStorage.getItem('jinqiu_local_draft')
      if (draft) {
        const draftData = JSON.parse(draft)
        setContentData(draftData.content)
        setTeamData(draftData.team)
        hasUnsavedChanges.current = true
      }
    } catch (error) {
      console.error('Failed to load local draft:', error)
    }
  }

  // 保存本地草稿
  const saveLocalDraft = () => {
    try {
      const draft = {
        timestamp: Date.now(),
        content: contentData,
        team: teamData
      }
      localStorage.setItem('jinqiu_local_draft', JSON.stringify(draft))
    } catch (error) {
      console.error('Failed to save local draft:', error)
    }
  }

  // 清除本地草稿
  const clearLocalDraft = () => {
    try {
      localStorage.removeItem('jinqiu_local_draft')
    } catch (error) {
      console.error('Failed to clear local draft:', error)
    }
  }

  // 保存版本到历史
  const saveVersion = (description: string = '自动保存') => {
    try {
      const newVersion = {
        timestamp: Date.now(),
        content: contentData,
        team: teamData,
        description
      }

      // 保留最近20个版本
      const updatedHistory = [newVersion, ...versionHistory].slice(0, 20)
      setVersionHistory(updatedHistory)
      localStorage.setItem('jinqiu_version_history', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Failed to save version:', error)
    }
  }

  // 回滚到指定版本
  const restoreVersion = (timestamp: number) => {
    const version = versionHistory.find(v => v.timestamp === timestamp)
    if (version) {
      if (confirm('确定要回滚到这个版本吗？当前未保存的更改将丢失。')) {
        setContentData(version.content)
        setTeamData(version.team)
        setMessage('✓ 已回滚到历史版本')
        setShowVersionHistory(false)
        markAsChanged()
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  // 删除指定版本
  const deleteVersion = (timestamp: number) => {
    if (confirm('确定要删除这个历史版本吗？')) {
      const updatedHistory = versionHistory.filter(v => v.timestamp !== timestamp)
      setVersionHistory(updatedHistory)
      localStorage.setItem('jinqiu_version_history', JSON.stringify(updatedHistory))
      setMessage('✓ 已删除历史版本')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  // 清空所有历史
  const clearAllVersions = () => {
    if (confirm('确定要清空所有历史版本吗？此操作不可恢复。')) {
      setVersionHistory([])
      localStorage.removeItem('jinqiu_version_history')
      setMessage('✓ 已清空历史版本')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  // 加载微信文章列表（支持传入参数覆盖当前状态）
  const loadWechatArticles = async (overrideCategory?: string, overrideSearch?: string) => {
    try {
      setWechatLoading(true)
      setWechatError(null)

      // 使用传入参数或当前状态
      const categoryToUse = overrideCategory !== undefined ? overrideCategory : wechatCategoryFilter
      const searchToUse = overrideSearch !== undefined ? overrideSearch : wechatSearchQuery

      const queryParams = new URLSearchParams()
      if (categoryToUse !== "all") {
        queryParams.append("category", categoryToUse)
      }
      if (searchToUse) {
        queryParams.append("search", searchToUse)
      }
      queryParams.append("password", password)

      const response = await fetch(`/api/admin/wechat-articles?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setWechatArticles(data.data)
      } else {
        setWechatError(data.error || "加载失败")
      }
    } catch (error) {
      console.error("Failed to load wechat articles:", error)
      setWechatError("加载失败")
    } finally {
      setWechatLoading(false)
    }
  }

  // 保存微信文章
  const saveWechatArticle = async (articleData: any) => {
    try {
      setSavingArticle(true)
      setSaveArticleSuccess(false)

      const response = await fetch("/api/admin/wechat-articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          ...articleData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSaveArticleSuccess(true)
        setMessage("✓ 文章保存成功")
        loadWechatArticles()

        // 延迟关闭弹窗，让用户看到成功状态
        setTimeout(() => {
          setEditingArticle(null)
          setSavingArticle(false)
          setSaveArticleSuccess(false)
        }, 1500)
      } else {
        setMessage(`保存失败: ${data.error}`)
        setSavingArticle(false)
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Failed to save article:", error)
      setMessage("保存失败")
      setSavingArticle(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  // 删除微信文章
  const deleteWechatArticle = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return

    try {
      const response = await fetch("/api/admin/wechat-articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("✓ 文章删除成功")
        loadWechatArticles()
      } else {
        setMessage(`删除失败: ${data.error}`)
      }
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Failed to delete article:", error)
      setMessage("删除失败")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  // 图片上传处理
  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error("图片读取失败"))
        }
      }
      reader.onerror = () => reject(new Error("图片读取失败"))
      reader.readAsDataURL(file)
    })
  }

  // 登录验证
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
        
        // 检查是否有本地草稿
        const hasDraft = checkForLocalDraft()
        
        if (hasDraft) {
          // 有本地草稿，询问用户是否恢复
          const useDraft = confirm(
            '🔔 检测到本地有未保存的编辑内容！\n\n' +
            '✅ 点击"确定"恢复本地编辑内容\n' +
            '❌ 点击"取消"加载服务器最新数据（本地编辑将丢失）'
          )
          
          if (useDraft) {
            loadLocalDraft()
            setMessage('✓ 已恢复本地编辑内容，请记得保存到服务器！')
            setTimeout(() => setMessage(''), 5000)
          } else {
            clearLocalDraft()
        loadData()
          }
        } else {
          loadData()
        }
        
        // 显示欢迎弹窗和撒花效果
        setShowWelcomeModal(true)
        setShowConfetti(true)
        // 3秒后停止撒花
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        setMessage("密码错误")
      }
    } catch (error) {
      setMessage("验证失败")
    }
  }

  // 实际保存函数
  const performSave = async (isAutoSave = false) => {
    if (isAutoSave) {
      setAutoSaving(true)
    } else {
    setSaving(true)
    setMessage("")
    }

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          content: contentData,
          team: teamData
        })
      })

      const result = await response.json()

      if (response.ok) {
        hasUnsavedChanges.current = false
        setLastSaved(new Date())
        
        // 保存成功后创建版本快照（仅本地，服务器会自动创建）
        const description = isAutoSave ? '自动保存' : '手动保存'
        saveVersion(description)
        
        // 保存成功后清除本地草稿
        clearLocalDraft()
          
        // 重新加载数据以同步主页
          await loadData()
        
        if (!isAutoSave) {
          // 根据返回的消息判断保存方式
          let saveMethod = 'Supabase 数据库'
          if (result.message) {
            if (result.message.includes('Supabase')) {
              saveMethod = 'Supabase 数据库'
              if (result.versions) {
                setMessage(`✓ 保存成功！版本: content v${result.versions.content}, team v${result.versions.team}`)
        } else {
                setMessage(`✓ 保存成功到 ${saveMethod}！`)
              }
            } else if (result.message.includes('file system')) {
              saveMethod = '本地文件系统'
              setMessage(`✓ 保存成功到 ${saveMethod}！（Supabase 未配置）`)
            } else {
              setMessage(`✓ ${result.message}`)
            }
          } else {
            setMessage(`✓ 保存成功到 ${saveMethod}！`)
        }
        
        setTimeout(() => setMessage(""), 5000)
        }
      } else {
        if (!isAutoSave) {
        const errorDetails = result.details ? `: ${result.details}` : ''
        setMessage(`❌ 保存失败${errorDetails}`)
        console.error('Save failed:', result)
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      if (!isAutoSave) {
      setMessage(`❌ 保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    } finally {
      if (isAutoSave) {
        setAutoSaving(false)
      } else {
      setSaving(false)
    }
  }
  }

  // 手动保存
  const handleSave = () => {
    performSave(false)
  }

  // 自动保存（防抖：用户停止输入2秒后保存）
  const debouncedAutoSave = useDebouncedCallback(
    () => {
      if (hasUnsavedChanges.current) {
        performSave(true)
      }
    },
    2000 // 2秒延迟
  )

  // 标记有未保存的更改并触发自动保存
  const markAsChanged = useCallback(() => {
    hasUnsavedChanges.current = true
    saveLocalDraft() // 保存本地草稿
    debouncedAutoSave()
  }, [debouncedAutoSave, contentData, teamData])

  // ===== 团队成员操作 =====
  const addTeamMember = () => {
    setTeamData([...teamData, { name: "", title: "", link: "" }])
  }

  const removeTeamMember = (index: number) => {
    setTeamData(teamData.filter((_, i) => i !== index))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamData]
    updated[index] = { ...updated[index], [field]: value }
    setTeamData(updated)
    markAsChanged()
  }

  // ===== 投资组合操作 =====
  const addPortfolioItem = () => {
    const updated = { ...contentData }
    updated.portfolio.items.push({ 
      name: { zh: "", en: "" }, 
      link: "",
      founders: []
    })
    setContentData(updated)
  }

  const removePortfolioItem = (index: number) => {
    const updated = { ...contentData }
    updated.portfolio.items = updated.portfolio.items.filter((_: any, i: number) => i !== index)
    setContentData(updated)
  }

  const updatePortfolioItem = (index: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "link") {
      updated.portfolio.items[index].link = value
    } else {
      updated.portfolio.items[index].name[lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  const addPortfolioFounder = (itemIndex: number) => {
    const updated = { ...contentData }
    if (!updated.portfolio.items[itemIndex].founders) {
      updated.portfolio.items[itemIndex].founders = []
    }
    updated.portfolio.items[itemIndex].founders.push({ name: { zh: "", en: "" }, link: "" })
    setContentData(updated)
  }

  const removePortfolioFounder = (itemIndex: number, founderIndex: number) => {
    const updated = { ...contentData }
    updated.portfolio.items[itemIndex].founders = updated.portfolio.items[itemIndex].founders.filter((_: any, i: number) => i !== founderIndex)
    setContentData(updated)
  }

  const updatePortfolioFounder = (itemIndex: number, founderIndex: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "link") {
      updated.portfolio.items[itemIndex].founders[founderIndex].link = value
    } else {
      updated.portfolio.items[itemIndex].founders[founderIndex].name[lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  // ===== 项目操作 =====
  const addProject = () => {
    const updated = { ...contentData }
    updated.projects.list.push({
      name: { zh: "", en: "" },
      desc: { zh: "", en: "" },
      link: ""
    })
    setContentData(updated)
  }

  const removeProject = (index: number) => {
    const updated = { ...contentData }
    updated.projects.list = updated.projects.list.filter((_: any, i: number) => i !== index)
    setContentData(updated)
  }

  const updateProject = (index: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "link") {
      updated.projects.list[index].link = value
    } else {
      updated.projects.list[index][field][lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  // ===== 研究活动操作 =====
  const addResearch = () => {
    const updated = { ...contentData }
    updated.research.list.push({
      name: { zh: "", en: "" },
      desc: { zh: "", en: "" },
      slug: "",
      intro: { zh: "", en: "" },
      articles: []
    })
    setContentData(updated)
  }

  const removeResearch = (index: number) => {
    const updated = { ...contentData }
    updated.research.list = updated.research.list.filter((_: any, i: number) => i !== index)
    setContentData(updated)
  }

  const updateResearch = (index: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "slug") {
      updated.research.list[index].slug = value
    } else if (field === "intro") {
      updated.research.list[index].intro[lang] = value
    } else {
      updated.research.list[index][field][lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  const addArticle = (researchIndex: number) => {
    const updated = { ...contentData }
    if (!updated.research.list[researchIndex].articles) {
      updated.research.list[researchIndex].articles = []
    }
    updated.research.list[researchIndex].articles.push({
      title: { zh: "", en: "" },
      slug: "",
      content: { zh: "", en: "" }
    })
    setContentData(updated)
  }

  const removeArticle = (researchIndex: number, articleIndex: number) => {
    const updated = { ...contentData }
    updated.research.list[researchIndex].articles = updated.research.list[researchIndex].articles.filter((_: any, i: number) => i !== articleIndex)
    setContentData(updated)
  }

  const updateArticle = (researchIndex: number, articleIndex: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "slug") {
      updated.research.list[researchIndex].articles[articleIndex].slug = value
    } else if (field === "content") {
      updated.research.list[researchIndex].articles[articleIndex].content[lang] = value
    } else {
      updated.research.list[researchIndex].articles[articleIndex][field][lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  // 切换文章展开/折叠状态
  const toggleArticleExpand = (researchIndex: number, articleIndex: number) => {
    const key = `${researchIndex}-${articleIndex}`
    setExpandedArticles(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 检查文章是否展开
  const isArticleExpanded = (researchIndex: number, articleIndex: number) => {
    const key = `${researchIndex}-${articleIndex}`
    return expandedArticles[key] || false
  }

  // 更新预览内容
  const updatePreview = (content: string, type: "intro" | "research-intro" | "research-article", researchIdx?: number, articleIdx?: number) => {
    setPreviewContent(content)
    setPreviewType(type)
    if (researchIdx !== undefined) setPreviewResearchIndex(researchIdx)
    if (articleIdx !== undefined) setPreviewArticleIndex(articleIdx)
    if (!showPreview) {
      setShowPreview(true)
    }
  }

  // 在新标签页打开预览
  const openPreviewInNewTab = () => {
    let url = ""
    if (previewType === "intro") {
      url = "/"
    } else if (previewType === "research-intro" && contentData.research.list[previewResearchIndex]) {
      const slug = contentData.research.list[previewResearchIndex].slug
      url = `/library/${slug}`
    } else if (previewType === "research-article" && contentData.research.list[previewResearchIndex]) {
      const researchSlug = contentData.research.list[previewResearchIndex].slug
      const article = contentData.research.list[previewResearchIndex].articles?.[previewArticleIndex]
      if (article?.slug) {
        url = `/library/${researchSlug}/${article.slug}`
      }
    }
    if (url) {
      window.open(url, '_blank')
    }
  }

  // 登录界面
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px"
        }}>
          <h1 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "bold" }}>
            管理后台登录
          </h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="请输入管理密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#225BBA",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              登录
            </button>
          </form>
          {message && (
            <div style={{ marginTop: "16px", color: "red", textAlign: "center" }}>
              {message}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!contentData) {
    return <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* 顶部栏 */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>锦秋基金 - 内容管理</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* 未保存警告 */}
          {hasUnsavedChanges.current && !autoSaving && !saving && (
            <span style={{
              color: "#ff9800",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#fff3e0",
              padding: "4px 10px",
              borderRadius: "4px",
              border: "1px solid #ffe0b2"
            }}>
              ⚠️ 有未保存到服务器的更改
            </span>
          )}
          
          {/* 自动保存状态 */}
          {autoSaving && (
            <span style={{
              color: "#17a2b8",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span className="saving-spinner" style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #17a2b8",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }} />
              自动保存中...
            </span>
          )}
          
          {/* 最后保存时间 */}
          {!autoSaving && lastSaved && (
            <span style={{
              color: "#28a745",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              ✓ 已保存 {new Date(lastSaved).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          
          {/* 手动保存消息 */}
          {message && (
            <span style={{
              color: message.includes("成功") ? "green" : "red",
              fontSize: "14px"
            }}>
              {message}
            </span>
          )}
          
          <button
            onClick={() => setShowVersionHistory(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "white",
              color: "#225BBA",
              border: "1px solid #225BBA",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            title="查看版本历史"
          >
            🕐 历史版本 {versionHistory.length > 0 && `(${versionHistory.length})`}
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px",
              backgroundColor: saving ? "#ccc" : "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {saving ? "保存中..." : "手动保存"}
          </button>
        </div>
      </div>

      {/* 标签导航 */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        padding: "0 24px",
        display: "flex",
        gap: "24px"
      }}>
        {[
          { key: "intro", label: "品牌介绍" },
          { key: "team", label: "团队" },
          { key: "portfolio", label: "投资组合" },
          { key: "projects", label: "项目" },
          { key: "research", label: "研究与活动" },
          { key: "wechat-articles", label: "微信文章" }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "16px 0",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #225BBA" : "2px solid transparent",
              color: activeTab === tab.key ? "#225BBA" : "#666",
              fontWeight: activeTab === tab.key ? "bold" : "normal",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ 
        display: "flex", 
        gap: showPreview ? "20px" : "0",
        padding: "24px",
        maxWidth: showPreview ? "100%" : "1200px",
        margin: "0 auto",
        transition: "all 0.3s"
      }}>
        {/* 左侧编辑区 */}
        <div style={{ 
          flex: showPreview ? "1" : "auto",
          width: showPreview ? "auto" : "100%",
          transition: "all 0.3s"
        }}>
        
        {/* ===== 品牌介绍 ===== */}
        {activeTab === "intro" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
              品牌介绍（富文本编辑）
            </h2>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                中文介绍
              </label>
              <RichTextEditor
                value={contentData.about.intro.zh}
                onChange={(value) => {
                  const updated = { ...contentData }
                  updated.about.intro.zh = value
                  setContentData(updated)
                  if (previewLanguage === "zh") updatePreview(value, "intro")
                }}
                placeholder="输入品牌介绍（中文）..."
                minHeight="250px"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                英文介绍
              </label>
              <RichTextEditor
                value={contentData.about.intro.en}
                onChange={(value) => {
                  const updated = { ...contentData }
                  updated.about.intro.en = value
                  setContentData(updated)
                  if (previewLanguage === "en") updatePreview(value, "intro")
                }}
                placeholder="Enter brand introduction (English)..."
                minHeight="250px"
              />
            </div>
          </div>
        )}

        {/* ===== 团队 ===== */}
        {activeTab === "team" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>团队成员</h2>
              <button
                onClick={addTeamMember}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                + 添加成员
              </button>
            </div>
            {teamData.map((member, index) => (
              <div key={index} style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <strong>成员 #{index + 1}</strong>
                  <button
                    onClick={() => removeTeamMember(index)}
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    删除
                  </button>
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="姓名"
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="职位（英文）"
                    value={member.title}
                    onChange={(e) => updateTeamMember(index, "title", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="个人主页链接（选填）"
                    value={member.link || ""}
                    onChange={(e) => updateTeamMember(index, "link", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 投资组合 ===== */}
        {activeTab === "portfolio" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>描述文本</h3>
              <input
                type="text"
                placeholder="中文描述"
                value={contentData.portfolio.desc.zh}
                onChange={(e) => {
                  const updated = { ...contentData }
                  updated.portfolio.desc.zh = e.target.value
                  setContentData(updated)
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginBottom: "8px"
                }}
              />
              <input
                type="text"
                placeholder="英文描述"
                value={contentData.portfolio.desc.en}
                onChange={(e) => {
                  const updated = { ...contentData }
                  updated.portfolio.desc.en = e.target.value
                  setContentData(updated)
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "bold" }}>投资项目列表</h3>
              <button
                onClick={addPortfolioItem}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                + 添加项目
              </button>
            </div>
            {contentData.portfolio.items.map((item: any, index: number) => (
              <div key={index} style={{
                border: "2px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
                backgroundColor: "#fafafa"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <strong style={{ fontSize: "16px" }}>项目 #{index + 1}</strong>
                  <button
                    onClick={() => removePortfolioItem(index)}
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    删除项目
                  </button>
                </div>
                
                {/* 项目基本信息 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px", 
                  marginBottom: "16px",
                  border: "1px solid #e0e0e0"
                }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                    📌 项目信息
                  </h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="项目名称（中文）"
                    value={item.name.zh}
                    onChange={(e) => updatePortfolioItem(index, "zh", "name", e.target.value)}
                    style={{
                        padding: "10px",
                      border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="项目名称（英文）"
                    value={item.name.en}
                    onChange={(e) => updatePortfolioItem(index, "en", "name", e.target.value)}
                    style={{
                        padding: "10px",
                      border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}
                  />
                  <input
                    type="text"
                      placeholder="项目官网链接（选填）"
                    value={item.link || ""}
                    onChange={(e) => updatePortfolioItem(index, "", "link", e.target.value)}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                {/* 创始人列表 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#225BBA" }}>
                      👤 创始人信息
                    </h4>
                    <button
                      onClick={() => addPortfolioFounder(index)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      + 添加创始人
                    </button>
                  </div>
                  
                  {item.founders && item.founders.length > 0 ? (
                    item.founders.map((founder: any, founderIndex: number) => (
                      <div key={founderIndex} style={{
                        backgroundColor: "#f9f9f9",
                        padding: "12px",
                        borderRadius: "4px",
                        marginBottom: "10px",
                        border: "1px solid #e8e8e8"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", color: "#666" }}>创始人 #{founderIndex + 1}</span>
                          <button
                            onClick={() => removePortfolioFounder(index, founderIndex)}
                            style={{
                              padding: "2px 8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "11px"
                            }}
                          >
                            删除
                          </button>
                        </div>
                        <div style={{ display: "grid", gap: "8px" }}>
                          <input
                            type="text"
                            placeholder="创始人姓名（中文）"
                            value={founder.name.zh}
                            onChange={(e) => updatePortfolioFounder(index, founderIndex, "zh", "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "13px"
                    }}
                  />
                          <input
                            type="text"
                            placeholder="创始人姓名（英文）"
                            value={founder.name.en}
                            onChange={(e) => updatePortfolioFounder(index, founderIndex, "en", "name", e.target.value)}
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}
                          />
                          <input
                            type="text"
                            placeholder="创始人个人链接（选填，如LinkedIn、Twitter等）"
                            value={founder.link || ""}
                            onChange={(e) => updatePortfolioFounder(index, founderIndex, "", "link", e.target.value)}
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#999", fontSize: "13px", fontStyle: "italic" }}>
                      暂无创始人信息，点击上方按钮添加
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 项目 ===== */}
        {activeTab === "projects" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>项目列表</h2>
              <button
                onClick={addProject}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                + 添加项目
              </button>
            </div>
            {contentData.projects.list.map((project: any, index: number) => (
              <div key={index} style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <strong>项目 #{index + 1}</strong>
                  <button
                    onClick={() => removeProject(index)}
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    删除
                  </button>
                </div>
                <div style={{ display: "grid", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="项目名称（中文）"
                    value={project.name.zh}
                    onChange={(e) => updateProject(index, "zh", "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="项目名称（英文）"
                    value={project.name.en}
                    onChange={(e) => updateProject(index, "en", "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <textarea
                    placeholder="项目描述（中文）"
                    value={project.desc.zh}
                    onChange={(e) => updateProject(index, "zh", "desc", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minHeight: "60px"
                    }}
                  />
                  <textarea
                    placeholder="项目描述（英文）"
                    value={project.desc.en}
                    onChange={(e) => updateProject(index, "en", "desc", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minHeight: "60px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="项目链接"
                    value={project.link}
                    onChange={(e) => updateProject(index, "", "link", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 研究与活动 ===== */}
        {activeTab === "research" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>研究与活动</h2>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#666" }}>💡 拖拽标签可排序</span>
              <button
                onClick={addResearch}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                + 添加项目
              </button>
            </div>
            </div>

            {/* 项目切换标签 - 支持拖拽排序 */}
            {contentData.research.list.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleResearchDragEnd}
              >
                <SortableContext
                  items={contentData.research.list.map((item: any, i: number) => item.slug || `item-${i}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div style={{
                    display: "flex",
                    gap: "4px",
                    marginBottom: "20px",
                    borderBottom: "2px solid #e0e0e0",
                    flexWrap: "wrap",
                    paddingBottom: "8px"
                  }}>
            {contentData.research.list.map((item: any, index: number) => (
                      <SortableItem key={item.slug || `item-${index}`} id={item.slug || `item-${index}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button
                            onClick={() => setActiveResearchIndex(index)}
                            style={{
                              padding: "10px 16px",
                              backgroundColor: activeResearchIndex === index ? "#225BBA" : item.hidden ? "#f0f0f0" : "transparent",
                              color: activeResearchIndex === index ? "white" : item.hidden ? "#999" : "#666",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: activeResearchIndex === index ? "bold" : "normal",
                              fontSize: "14px",
                borderRadius: "4px",
                              transition: "all 0.2s",
                              textDecoration: item.hidden ? "line-through" : "none",
                              opacity: item.hidden ? 0.6 : 1,
                            }}
                          >
                            {item.hidden && "🙈 "}
                            {item.name.zh || `项目 ${index + 1}`}
                          </button>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* 当前选中的项目 */}
            {contentData.research.list.length > 0 && contentData.research.list[activeResearchIndex] && (() => {
              const item = contentData.research.list[activeResearchIndex]
              const index = activeResearchIndex
              return (
              <div key={index} style={{
                border: item.hidden ? "2px dashed #ccc" : "2px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
                backgroundColor: item.hidden ? "#f9f9f9" : "#fafafa",
                opacity: item.hidden ? 0.8 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <strong style={{ fontSize: "16px" }}>项目 #{index + 1}</strong>
                    <VisibilityToggle
                      hidden={item.hidden || false}
                      onChange={() => toggleResearchHidden(index)}
                    />
                  </div>
                  <button
                    onClick={() => removeResearch(index)}
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    删除
                  </button>
                </div>
                
                {item.hidden && (
                  <div style={{
                    padding: "8px 12px",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "4px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    color: "#856404"
                  }}>
                    ⚠️ 此栏目已隐藏，不会在前台显示
                  </div>
                )}
                
                {/* 基本信息 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px", 
                  marginBottom: "16px",
                  border: "1px solid #e0e0e0"
                }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                    📌 基本信息
                  </h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="名称（中文）"
                    value={item.name.zh}
                    onChange={(e) => updateResearch(index, "zh", "name", e.target.value)}
                    style={{
                        padding: "10px",
                      border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="名称（英文）"
                    value={item.name.en}
                    onChange={(e) => updateResearch(index, "en", "name", e.target.value)}
                    style={{
                        padding: "10px",
                      border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}
                  />
                  <textarea
                      placeholder="简短描述（中文）- 显示在列表"
                    value={item.desc.zh}
                    onChange={(e) => updateResearch(index, "zh", "desc", e.target.value)}
                    style={{
                        padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                        minHeight: "60px",
                        fontSize: "14px"
                    }}
                  />
                  <textarea
                      placeholder="简短描述（英文）- 显示在列表"
                    value={item.desc.en}
                    onChange={(e) => updateResearch(index, "en", "desc", e.target.value)}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        minHeight: "60px",
                        fontSize: "14px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="URL Slug（英文，如: jinqiu-select）"
                      value={item.slug || ""}
                      onChange={(e) => updateResearch(index, "", "slug", e.target.value)}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontFamily: "monospace"
                      }}
                    />
                    {item.slug && (
                      <div style={{ fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                        页面链接: /library/{item.slug}
                      </div>
                    )}
                  </div>
                </div>

                {/* 页面介绍 - 富文本编辑 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px",
                  marginBottom: "16px",
                  border: "1px solid #e0e0e0"
                }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                    📝 页面顶部介绍（富文本）
                  </h4>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                      中文介绍
                    </label>
                    <RichTextEditor
                      value={item.intro?.zh || ""}
                      onChange={(value) => {
                        updateResearch(index, "zh", "intro", value)
                        if (previewLanguage === "zh") updatePreview(value, "research-intro", index)
                      }}
                      placeholder="输入页面顶部介绍（中文）..."
                      minHeight="200px"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                      英文介绍
                    </label>
                    <RichTextEditor
                      value={item.intro?.en || ""}
                      onChange={(value) => {
                        updateResearch(index, "en", "intro", value)
                        if (previewLanguage === "en") updatePreview(value, "research-intro", index)
                      }}
                      placeholder="Enter page intro (English)..."
                      minHeight="200px"
                    />
                  </div>
                </div>

                {/* 文章列表 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#225BBA" }}>
                      📚 文章列表
                    </h4>
                    <button
                      onClick={() => addArticle(index)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      + 添加文章
                    </button>
                  </div>
                  
                  {item.articles && item.articles.length > 0 ? (
                    item.articles.map((article: any, articleIndex: number) => {
                      const isExpanded = isArticleExpanded(index, articleIndex)
                      return (
                        <div key={articleIndex} style={{
                          backgroundColor: "#f9f9f9",
                          padding: "16px",
                          borderRadius: "4px",
                          marginBottom: "12px",
                          border: "1px solid #e8e8e8"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isExpanded ? "12px" : "0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                              <button
                                onClick={() => toggleArticleExpand(index, articleIndex)}
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "transparent",
                                  border: "1px solid #ddd",
                                  borderRadius: "3px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                                title={isExpanded ? "折叠" : "展开"}
                              >
                                {isExpanded ? "▼" : "▶"}
                              </button>
                              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#666" }}>
                                文章 #{articleIndex + 1}: {article.title?.zh || article.title?.en || "未命名"}
                              </span>
                            </div>
                            <button
                              onClick={() => removeArticle(index, articleIndex)}
                              style={{
                                padding: "4px 12px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "11px"
                              }}
                            >
                              删除
                            </button>
                          </div>
                          
                          {isExpanded && (
                            <>
                              {/* 文章基本信息 */}
                              <div style={{ display: "grid", gap: "10px", marginBottom: "12px" }}>
                                <input
                                  type="text"
                                  placeholder="文章标题（中文）"
                                  value={article.title?.zh || ""}
                                  onChange={(e) => updateArticle(index, articleIndex, "zh", "title", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                                    fontSize: "13px"
                    }}
                  />
                  <input
                    type="text"
                                  placeholder="文章标题（英文）"
                                  value={article.title?.en || ""}
                                  onChange={(e) => updateArticle(index, articleIndex, "en", "title", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "13px"
                    }}
                  />
                                <input
                                  type="text"
                                  placeholder="文章URL Slug（英文，如: article-1）"
                                  value={article.slug || ""}
                                  onChange={(e) => updateArticle(index, articleIndex, "", "slug", e.target.value)}
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    fontFamily: "monospace"
                                  }}
                                />
                                {item.slug && article.slug && (
                                  <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>
                                    文章链接: /library/{item.slug}/{article.slug}
                </div>
                                )}
              </div>

                              {/* 文章内容 */}
                              <div style={{ marginTop: "12px" }}>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "12px" }}>
                                  文章内容（中文）
                                </label>
                                <RichTextEditor
                                  value={article.content?.zh || ""}
                                  onChange={(value) => {
                                    updateArticle(index, articleIndex, "zh", "content", value)
                                    if (previewLanguage === "zh") updatePreview(value, "research-article", index, articleIndex)
                                  }}
                                  placeholder="输入文章内容（中文）..."
                                  minHeight="250px"
                                />
                              </div>
                              <div style={{ marginTop: "12px" }}>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "12px" }}>
                                  文章内容（英文）
                                </label>
                                <RichTextEditor
                                  value={article.content?.en || ""}
                                  onChange={(value) => {
                                    updateArticle(index, articleIndex, "en", "content", value)
                                    if (previewLanguage === "en") updatePreview(value, "research-article", index, articleIndex)
                                  }}
                                  placeholder="Enter article content (English)..."
                                  minHeight="250px"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p style={{ color: "#999", fontSize: "13px", fontStyle: "italic" }}>
                      暂无文章，点击上方按钮添加
                    </p>
                  )}
                </div>
               </div>
               )
             })()}
           </div>
         )}

        {/* ===== 微信文章管理 ===== */}
        {activeTab === "wechat-articles" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>微信文章管理</h2>
              <button
                onClick={() => loadWechatArticles()}
                disabled={wechatLoading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: wechatLoading ? "not-allowed" : "pointer",
                  opacity: wechatLoading ? 0.6 : 1,
                }}
              >
                {wechatLoading ? "加载中..." : "刷新文章列表"}
              </button>
            </div>

            {/* 筛选和搜索 - 两步操作：1.选分类 2.搜索 */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column",
              gap: "12px", 
              marginBottom: "20px", 
              padding: "16px",
              backgroundColor: "#f8f9f8",
              borderRadius: "6px",
              border: "1px solid #e0e0e0"
            }}>
              {/* 第一步：选择分类 */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#333" }}>① 选择分类：</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { value: "all", label: "全部" },
                    { value: "jinqiu-spotlight", label: "Spotlight" },
                    { value: "jinqiu-select", label: "Select" },
                    { value: "jinqiu-lab", label: "AI实验室" },
                    { value: "jinqiu-roundtable", label: "小饭桌" },
                    { value: "jinqiu-summit", label: "锦秋会" },
                  ].map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setWechatCategoryFilter(cat.value)
                        // 切换分类时自动加载（传入新分类，保留当前搜索词）
                        loadWechatArticles(cat.value, wechatSearchQuery)
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: wechatCategoryFilter === cat.value ? "#225BBA" : "white",
                        color: wechatCategoryFilter === cat.value ? "white" : "#666",
                        border: `1px solid ${wechatCategoryFilter === cat.value ? "#225BBA" : "#ddd"}`,
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: wechatCategoryFilter === cat.value ? "bold" : "normal",
                        transition: "all 0.2s"
                      }}
                    >
                      {cat.label}
                    </button>
            ))}
          </div>
              </div>

              {/* 第二步：搜索 */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#333" }}>② 搜索：</span>
                <div style={{ display: "flex", gap: "8px", flex: 1, minWidth: "200px" }}>
                  <input
                    type="text"
                    placeholder={wechatCategoryFilter === "all" 
                      ? "在全部文章中搜索..." 
                      : `在当前分类中搜索...`}
                    value={wechatSearchQuery}
                    onChange={(e) => setWechatSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loadWechatArticles()
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      flex: 1
                    }}
                  />
                  <button
                    onClick={() => loadWechatArticles()}
                    disabled={wechatLoading}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#225BBA",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: wechatLoading ? "not-allowed" : "pointer",
                      opacity: wechatLoading ? 0.6 : 1,
                    }}
                  >
                    🔍 搜索
                  </button>
                  {(wechatSearchQuery || wechatCategoryFilter !== "all") && (
                    <button
                      onClick={() => {
                        setWechatCategoryFilter("all")
                        setWechatSearchQuery("")
                        loadWechatArticles("all", "")
                      }}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f0f0f0",
                        color: "#666",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ↺ 重置
                    </button>
                  )}
                </div>
              </div>

              {/* 当前筛选状态 */}
              <div style={{ 
                fontSize: "12px", 
                color: "#666",
                padding: "8px 12px",
                backgroundColor: "#e8f4fd",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>📋 当前显示：</span>
                <span style={{ fontWeight: "bold", color: "#225BBA" }}>
                  {wechatCategoryFilter === "all" ? "全部分类" : 
                    { "jinqiu-spotlight": "Jinqiu Spotlight", "jinqiu-select": "Jinqiu Select", 
                      "jinqiu-lab": "锦秋AI实验室", "jinqiu-roundtable": "锦秋小饭桌", 
                      "jinqiu-summit": "锦秋会" }[wechatCategoryFilter] || wechatCategoryFilter}
                </span>
                {wechatSearchQuery && (
                  <>
                    <span>→</span>
                    <span>关键词 "<strong>{wechatSearchQuery}</strong>"</span>
                  </>
                )}
                <span style={{ marginLeft: "auto" }}>
                  共 {wechatArticles.length} 篇文章
                </span>
              </div>
            </div>

            {/* 错误提示 */}
            {wechatError && (
              <div style={{
                padding: "12px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
                marginBottom: "20px"
              }}>
                ❌ {wechatError}
              </div>
            )}

            {/* 加载状态 */}
            {wechatLoading && (
              <div style={{
                padding: "40px",
                textAlign: "center",
                color: "#666"
              }}>
                加载中...
              </div>
            )}

            {/* 文章列表 */}
            {!wechatLoading && wechatArticles.length > 0 && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {wechatArticles.map((article) => (
                  <div
                    key={article.id}
                    style={{
                      border: article.hidden ? "1px dashed #ccc" : "1px solid #e0e0e0",
                      borderRadius: "6px",
                      padding: "16px",
                      backgroundColor: article.hidden ? "#f9f9f9" : "#fafafa",
                      transition: "all 0.2s",
                      opacity: article.hidden ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* 标题和封面图 */}
                        <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                          {article.cover_image && (
                            <img
                              src={article.cover_image}
                              alt=""
                              style={{
                                width: "120px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                flexShrink: 0,
                                filter: article.hidden ? "grayscale(100%)" : "none",
                              }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                              <h4 style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: article.hidden ? "#999" : "#225BBA",
                                lineHeight: "1.4",
                                textDecoration: article.hidden ? "line-through" : "none",
                              }}>
                                {article.hidden && "🙈 "}
                                {article.title}
                              </h4>
                            </div>
                            <p style={{
                              fontSize: "13px",
                              color: "#666",
                              marginBottom: "8px",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: "1.5"
                            }}>
                              {article.description || "暂无描述"}
                            </p>
                          </div>
                        </div>

                        {/* 元信息 */}
                        <div style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "12px",
                          color: "#999",
                          flexWrap: "wrap",
                          alignItems: "center"
                        }}>
                          <span>📅 {article.publish_date}</span>
                          <span>📁 {article.category || "未分类"}</span>
                          <span>📱 {article.mp_name || "未知来源"}</span>
                          {article.hidden && (
                            <span style={{ 
                              backgroundColor: "#f8d7da", 
                              color: "#721c24", 
                              padding: "2px 8px", 
                              borderRadius: "4px",
                              fontSize: "11px"
                            }}>
                              已隐藏
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        marginLeft: "16px",
                        flexShrink: 0
                      }}>
                        {/* 隐藏/显示按钮 */}
                        <button
                          onClick={() => toggleWechatArticleHidden(article.id, article.hidden)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: article.hidden ? "#d4edda" : "#f8d7da",
                            color: article.hidden ? "#155724" : "#721c24",
                            border: `1px solid ${article.hidden ? "#c3e6cb" : "#f5c6cb"}`,
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                          title={article.hidden ? "点击显示" : "点击隐藏"}
                        >
                          {article.hidden ? "👁️ 显示" : "🙈 隐藏"}
                        </button>
                        <button
                          onClick={() => setEditingArticle(article)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#225BBA",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                          title="编辑文章"
                        >
                          ✏️ 编辑
                        </button>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
                            textDecoration: "none",
                            textAlign: "center"
                          }}
                          title="查看原文"
                        >
                          🔗 原文
                        </a>
                        <button
                          onClick={() => deleteWechatArticle(article.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                          title="删除文章"
                        >
                          🗑️ 删除
                        </button>
                      </div>
                </div>
              </div>
            ))}
          </div>
        )}

            {/* 无文章提示 */}
            {!wechatLoading && wechatArticles.length === 0 && !wechatError && (
              <div style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#999"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <p>暂无文章</p>
              </div>
            )}
          </div>
        )}
         </div>

        {/* 右侧预览区 */}
        {showPreview && (
          <div style={{
            flex: "0 0 45%",
            position: "sticky",
            top: "80px",
            height: "calc(100vh - 100px)",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* 预览头部 */}
            <div style={{
              padding: "16px",
              borderBottom: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
                📱 实时预览
              </h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* 语言切换 */}
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => setPreviewLanguage("zh")}
                    style={{
                      padding: "4px 10px",
                      backgroundColor: previewLanguage === "zh" ? "#225BBA" : "#f0f0f0",
                      color: previewLanguage === "zh" ? "white" : "#666",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: previewLanguage === "zh" ? "bold" : "normal"
                    }}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => setPreviewLanguage("en")}
                    style={{
                      padding: "4px 10px",
                      backgroundColor: previewLanguage === "en" ? "#225BBA" : "#f0f0f0",
                      color: previewLanguage === "en" ? "white" : "#666",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: previewLanguage === "en" ? "bold" : "normal"
                    }}
                  >
                    English
                  </button>
                </div>
                <button
                  onClick={openPreviewInNewTab}
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                  title="在新标签页打开"
                >
                  🔗 新标签页
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                  title="关闭预览"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 预览内容 */}
            <div style={{
              flex: 1,
              overflow: "auto",
              backgroundColor: "white"
            }}>
              {previewContent ? (
                <div style={{
                  maxWidth: "800px",
                  margin: "0 auto",
                  padding: "40px 20px",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  lineHeight: "1.6",
                  color: "#000"
                }}>
                  {/* 模拟页面头部 */}
                  <div style={{ 
                    marginBottom: "40px", 
                    paddingBottom: "20px", 
                    borderBottom: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <img 
                      src="/jinqiu-logo.png" 
                      alt="Jinqiu Capital"
                      style={{ height: "32px" }}
                    />
                    <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                      {contentData?.settings?.brandName?.[previewLanguage] || "锦秋基金"}
                    </h1>
                  </div>
                  
                  {/* 内容区域 */}
                  <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                  
                  {/* 模拟页面底部 */}
                  <div style={{ 
                    marginTop: "60px", 
                    paddingTop: "20px", 
                    borderTop: "1px solid #e0e0e0",
                    fontSize: "14px",
                    color: "#666"
                  }}>
                    <p>{previewLanguage === "zh" ? "© 2025 锦秋基金" : "© 2025 Jinqiu Capital"}</p>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  color: "#999", 
                  textAlign: "center", 
                  padding: "60px 20px",
                  fontSize: "14px" 
                }}>
                  <p style={{ marginBottom: "10px", fontSize: "48px" }}>👁️</p>
                  <p>在富文本编辑器中输入内容</p>
                  <p style={{ fontSize: "12px", marginTop: "8px" }}>点击任意富文本编辑器即可看到实时预览</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 版本历史弹窗 */}
      {showVersionHistory && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "modal-fade-in 0.3s ease-out"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            maxWidth: "800px",
            width: "100%",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "modal-scale-in 0.3s ease-out"
          }}>
            {/* 头部 */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: 0, marginBottom: "4px" }}>
                  🕐 版本历史
                </h3>
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                  共 {versionHistory.length} 个版本 · 最多保留20个版本
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {versionHistory.length > 0 && (
                  <button
                    onClick={clearAllVersions}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    清空全部
                  </button>
                )}
                <button
                  onClick={() => setShowVersionHistory(false)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  关闭
                </button>
              </div>
            </div>

            {/* 版本列表 */}
            <div style={{
              flex: 1,
              overflow: "auto",
              padding: "16px 24px"
            }}>
              {versionHistory.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#999"
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
                  <p>还没有版本历史</p>
                  <p style={{ fontSize: "14px", marginTop: "8px" }}>
                    保存内容后会自动创建版本快照
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {versionHistory.map((version, index) => (
                    <div
                      key={version.timestamp}
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: selectedVersion === version.timestamp ? "#f0f8ff" : "white",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                              版本 #{versionHistory.length - index}
                            </span>
                            <span style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              backgroundColor: version.description === '手动保存' ? "#225BBA" : "#17a2b8",
                              color: "white",
                              borderRadius: "10px"
                            }}>
                              {version.description}
                            </span>
                          </div>
                          <div style={{ fontSize: "13px", color: "#666" }}>
                            {new Date(version.timestamp).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => setSelectedVersion(
                              selectedVersion === version.timestamp ? null : version.timestamp
                            )}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#f0f0f0",
                              color: "#333",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            {selectedVersion === version.timestamp ? "收起" : "查看"}
                          </button>
                          <button
                            onClick={() => restoreVersion(version.timestamp)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            回滚
                          </button>
                          <button
                            onClick={() => deleteVersion(version.timestamp)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      
                      {/* 版本详情 - 显示详细更改 */}
                      {selectedVersion === version.timestamp && (
                        <div style={{
                          marginTop: "12px",
                          padding: "12px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "6px",
                          fontSize: "13px",
                          maxHeight: "400px",
                          overflow: "auto"
                        }}>
                          {(() => {
                            // 获取当前版本和上一版本的数据
                            const currentVersion = version
                            const previousVersion = index < versionHistory.length - 1 ? versionHistory[index + 1] : null
                            
                            const changes: string[] = []
                            
                            if (currentVersion.content && previousVersion?.content) {
                              // 检测内容更改
                              const curr = currentVersion.content
                              const prev = previousVersion.content
                              
                              // 品牌名称
                              if (curr.settings?.brandName?.zh !== prev.settings?.brandName?.zh) {
                                changes.push(`🏷️ 品牌名称(中): ${prev.settings?.brandName?.zh || '无'} → ${curr.settings?.brandName?.zh || '无'}`)
                              }
                              if (curr.settings?.brandName?.en !== prev.settings?.brandName?.en) {
                                changes.push(`🏷️ 品牌名称(英): ${prev.settings?.brandName?.en || '无'} → ${curr.settings?.brandName?.en || '无'}`)
                              }
                              
                              // 关于我们
                              if (curr.about?.intro?.zh !== prev.about?.intro?.zh) {
                                const prevLength = prev.about?.intro?.zh?.length || 0
                                const currLength = curr.about?.intro?.zh?.length || 0
                                changes.push(`📝 关于我们(中): ${prevLength}字 → ${currLength}字`)
                              }
                              if (curr.about?.intro?.en !== prev.about?.intro?.en) {
                                const prevLength = prev.about?.intro?.en?.length || 0
                                const currLength = curr.about?.intro?.en?.length || 0
                                changes.push(`📝 关于我们(英): ${prevLength}字 → ${currLength}字`)
                              }
                              
                              // 投资组合
                              const prevPortfolioCount = prev.portfolio?.items?.length || 0
                              const currPortfolioCount = curr.portfolio?.items?.length || 0
                              if (prevPortfolioCount !== currPortfolioCount) {
                                changes.push(`💼 投资组合: ${prevPortfolioCount}个 → ${currPortfolioCount}个`)
                              } else if (JSON.stringify(curr.portfolio?.items) !== JSON.stringify(prev.portfolio?.items)) {
                                changes.push(`💼 投资组合: 内容已修改 (${currPortfolioCount}个项目)`)
                              }
                              
                              // 项目
                              const prevProjectsCount = prev.projects?.list?.length || 0
                              const currProjectsCount = curr.projects?.list?.length || 0
                              if (prevProjectsCount !== currProjectsCount) {
                                changes.push(`🚀 项目: ${prevProjectsCount}个 → ${currProjectsCount}个`)
                              } else if (JSON.stringify(curr.projects?.list) !== JSON.stringify(prev.projects?.list)) {
                                changes.push(`🚀 项目: 内容已修改 (${currProjectsCount}个项目)`)
                              }
                              
                              // 研究活动
                              const prevResearchCount = prev.research?.list?.length || 0
                              const currResearchCount = curr.research?.list?.length || 0
                              if (prevResearchCount !== currResearchCount) {
                                changes.push(`📚 研究活动: ${prevResearchCount}个 → ${currResearchCount}个`)
                              } else if (JSON.stringify(curr.research?.list) !== JSON.stringify(prev.research?.list)) {
                                changes.push(`📚 研究活动: 内容已修改 (${currResearchCount}个项目)`)
                                
                                // 检测具体哪个研究活动被修改
                                curr.research?.list?.forEach((item: any, i: number) => {
                                  const prevItem = prev.research?.list?.[i]
                                  if (prevItem) {
                                    if (item.intro?.zh !== prevItem.intro?.zh) {
                                      changes.push(`  ↳ ${item.name?.zh || item.name?.en}: 简介(中)已修改`)
                                    }
                                    if (item.intro?.en !== prevItem.intro?.en) {
                                      changes.push(`  ↳ ${item.name?.zh || item.name?.en}: 简介(英)已修改`)
                                    }
                                    if (item.articles?.length !== prevItem.articles?.length) {
                                      changes.push(`  ↳ ${item.name?.zh || item.name?.en}: 文章数 ${prevItem.articles?.length || 0} → ${item.articles?.length || 0}`)
                                    }
                                  }
                                })
                              }
                            }
                            
                            if (currentVersion.team && previousVersion?.team) {
                              // 检测团队更改
                              const prevTeamCount = previousVersion.team?.length || 0
                              const currTeamCount = currentVersion.team?.length || 0
                              if (prevTeamCount !== currTeamCount) {
                                changes.push(`👥 团队成员: ${prevTeamCount}人 → ${currTeamCount}人`)
                              } else if (JSON.stringify(currentVersion.team) !== JSON.stringify(previousVersion.team)) {
                                changes.push(`👥 团队成员: 信息已修改 (${currTeamCount}人)`)
                              }
                            }
                            
                            return (
                              <div>
                                <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
                                  📋 详细更改历史：
                                </div>
                                {changes.length > 0 ? (
                                  <div style={{ color: "#444", lineHeight: "2", whiteSpace: "pre-wrap" }}>
                                    {changes.map((change, i) => (
                                      <div key={i} style={{ 
                                        padding: "4px 0",
                                        borderBottom: i < changes.length - 1 ? "1px solid #e0e0e0" : "none"
                                      }}>
                                        {change}
              </div>
            ))}
          </div>
                                ) : (
                                  <div style={{ color: "#999", fontStyle: "italic" }}>
                                    {index === versionHistory.length - 1 ? "初始版本" : "无更改"}
                                  </div>
                                )}
                                
                                {/* 数据概览 */}
                                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #ddd" }}>
                                  <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
                                    📊 数据快照：
                                  </div>
                                  <div style={{ color: "#666", lineHeight: "1.8" }}>
                                    • 团队成员: {version.team?.length || 0} 人<br/>
                                    • 投资项目: {version.content?.portfolio?.items?.length || 0} 个<br/>
                                    • 项目: {version.content?.projects?.list?.length || 0} 个<br/>
                                    • 研究活动: {version.content?.research?.list?.length || 0} 个
                                  </div>
      </div>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 撒花效果 */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#225BBA', '#17a2b8', '#28a745', '#ffc107', '#dc3545', '#6f42c1']}
        />
      )}

      {/* 欢迎弹窗 */}
      {showWelcomeModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "modal-fade-in 0.3s ease-out"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            maxWidth: "600px",
            width: "100%",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "modal-scale-in 0.3s ease-out",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* 装饰性渐变背景 */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #225BBA, #17a2b8, #28a745, #ffc107)"
            }} />

            {/* 关闭按钮 */}
            <button
              onClick={() => setShowWelcomeModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
                lineHeight: 1,
                padding: "8px"
              }}
            >
              ✕
            </button>

            {/* 标题 */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
              <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                欢迎回来！
              </h2>
              <p style={{ fontSize: "16px", color: "#666" }}>
                锦秋基金内容管理系统
              </p>
            </div>

            {/* 功能更新列表 */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>
                ✨ 最新功能更新
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* 功能1 */}
                <div style={{ 
                  padding: "16px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px",
                  borderLeft: "4px solid #225BBA"
                }}>
                  <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>👁️</span>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "4px", color: "#225BBA" }}>
                        实时预览功能
                      </h4>
                      <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                        左侧编辑，右侧实时预览！支持中英文切换，可在新标签页打开真实页面效果
                      </p>
                    </div>
                  </div>
                </div>

                {/* 功能2 */}
                <div style={{ 
                  padding: "16px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px",
                  borderLeft: "4px solid #17a2b8"
                }}>
                  <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>📚</span>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "4px", color: "#17a2b8" }}>
                        三级页面系统
                      </h4>
                      <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                        研究与活动支持项目介绍页和文章页，可折叠管理，更加清晰
                      </p>
                    </div>
                  </div>
                </div>

                {/* 功能3 */}
                <div style={{ 
                  padding: "16px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px",
                  borderLeft: "4px solid #28a745"
                }}>
                  <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>👥</span>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "4px", color: "#28a745" }}>
                        创始人信息管理
                      </h4>
                      <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                        投资组合支持添加多位创始人，包含中英文名称和个人链接
                      </p>
                    </div>
                  </div>
                </div>

                {/* 功能4 */}
                <div style={{ 
                  padding: "16px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px",
                  borderLeft: "4px solid #ffc107"
                }}>
                  <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>🎨</span>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "4px", color: "#f59e0b" }}>
                        富文本编辑器
                      </h4>
                      <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" }}>
                        支持粗体、斜体、列表、链接等格式，所见即所得的编辑体验
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowWelcomeModal(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  backgroundColor: "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1a4a94"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#225BBA"}
              >
                开始使用 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文章编辑弹窗 */}
      {editingArticle && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "modal-fade-in 0.2s ease-out"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "1000px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "modal-scale-in 0.2s ease-out"
          }}>
            {/* 弹窗头部 */}
            <div style={{
              padding: "20px",
              borderBottom: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8f8f8"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
                编辑文章
              </h3>
              <button
                onClick={() => setEditingArticle(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                关闭
              </button>
            </div>

            {/* 弹窗内容 */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px"
            }}>
              {/* 基本信息 */}
              <div style={{
                backgroundColor: "#f8f8f8",
                padding: "16px",
                borderRadius: "6px",
                marginBottom: "20px",
                border: "1px solid #e0e0e0"
              }}>
                <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                  📌 基本信息
                </h4>
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                      文章标题
                    </label>
                    <input
                      type="text"
                      value={editingArticle.title}
                      onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        width: "100%"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                      文章描述
                    </label>
                    <textarea
                      value={editingArticle.description || ""}
                      onChange={(e) => setEditingArticle({...editingArticle, description: e.target.value})}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        width: "100%",
                        minHeight: "80px",
                        resize: "vertical"
                      }}
                      placeholder="简短描述，将显示在文章列表中"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                      封面图片 URL
                    </label>
                    <input
                      type="text"
                      value={editingArticle.cover_image || ""}
                      onChange={(e) => setEditingArticle({...editingArticle, cover_image: e.target.value})}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        width: "100%"
                      }}
                      placeholder="输入图片 URL 或在下方内容中插入图片"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                      分类
                    </label>
                    <select
                      value={editingArticle.category || ""}
                      onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        width: "100%"
                      }}
                    >
                      <option value="">未分类</option>
                      <option value="jinqiu-select">Jinqiu Select</option>
                      <option value="jinqiu-scan">Jinqiu Scan</option>
                      <option value="jinqiu-spotlight">Jinqiu Spotlight</option>
                      <option value="jinqiu-roundtable">锦秋小饭桌</option>
                      <option value="jinqiu-summit">锦秋会</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 文章内容 */}
              <div style={{
                backgroundColor: "#f8f8f8",
                padding: "16px",
                borderRadius: "6px",
                border: "1px solid #e0e0e0"
              }}>
                <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                  📝 文章内容（富文本编辑）
                </h4>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
                  💡 提示：点击工具栏的 🖼️ 插入图片 按钮可在文章中插入图片
                </div>
                <RichTextEditor
                  value={editingArticle.content || ""}
                  onChange={(value) => setEditingArticle({...editingArticle, content: value})}
                  placeholder="输入文章内容..."
                  minHeight="400px"
                  onImageUpload={handleImageUpload}
                />
              </div>
            </div>

            {/* 弹窗底部 */}
            <div style={{
              padding: "20px",
              borderTop: "1px solid #ddd",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "#f8f8f8"
            }}>
              <button
                onClick={() => setEditingArticle(null)}
                disabled={savingArticle}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: savingArticle ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: savingArticle ? 0.5 : 1
                }}
              >
                取消
              </button>
              <button
                onClick={() => saveWechatArticle(editingArticle)}
                disabled={savingArticle}
                style={{
                  padding: "10px 20px",
                  backgroundColor: saveArticleSuccess ? "#28a745" : "#225BBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: savingArticle ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  opacity: savingArticle ? 0.7 : 1,
                  minWidth: "120px"
                }}
              >
                {savingArticle ? "保存中..." : saveArticleSuccess ? "✓ 保存成功" : "保存更改"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes modal-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modal-scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
