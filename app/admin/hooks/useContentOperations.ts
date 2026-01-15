"use client"

import { useState, useCallback } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import type { DragEndEvent } from "@dnd-kit/core"
import type { ContentData, TeamMember, PreviewType } from "../types"

interface UseContentOperationsProps {
  contentData: ContentData | null
  setContentData: (data: ContentData) => void
  teamData: TeamMember[]
  setTeamData: (data: TeamMember[]) => void
  markAsChanged: () => void
  hasUnsavedChanges: React.MutableRefObject<boolean>
}

export function useContentOperations({
  contentData,
  setContentData,
  teamData,
  setTeamData,
  markAsChanged,
  hasUnsavedChanges,
}: UseContentOperationsProps) {
  const [activeResearchIndex, setActiveResearchIndex] = useState(0)
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({})

  // ===== 团队成员操作 =====
  const addTeamMember = () => {
    setTeamData([...teamData, { 
      name: { zh: "", en: "" }, 
      title: "", 
      title_zh: "",
      link: "" 
    }])
  }

  const removeTeamMember = (index: number) => {
    setTeamData(teamData.filter((_, i) => i !== index))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamData]
    
    // 处理中英文名称字段
    if (field === "name_zh" || field === "name_en") {
      // 确保 name 是对象格式
      const currentName = typeof updated[index].name === 'object' 
        ? updated[index].name 
        : { zh: updated[index].name || "", en: "" }
      
      updated[index] = {
        ...updated[index],
        name: {
          ...(currentName as { zh: string; en: string }),
          [field === "name_zh" ? "zh" : "en"]: value
        }
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    
    setTeamData(updated)
    markAsChanged()
  }

  // ===== 投资组合操作 =====
  const addPortfolioItem = () => {
    if (!contentData) return
    const updated = { ...contentData }
    updated.portfolio.items.push({ 
      name: { zh: "", en: "" }, 
      link: "",
      founders: []
    })
    setContentData(updated)
  }

  const removePortfolioItem = (index: number) => {
    if (!contentData) return
    const updated = { ...contentData }
    updated.portfolio.items = updated.portfolio.items.filter((_, i) => i !== index)
    setContentData(updated)
  }

  const updatePortfolioItem = (index: number, lang: string, field: string, value: string) => {
    if (!contentData) return
    const updated = { ...contentData }
    if (field === "link") {
      updated.portfolio.items[index].link = value
    } else {
      (updated.portfolio.items[index].name as any)[lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  const addPortfolioFounder = (itemIndex: number) => {
    if (!contentData) return
    const updated = { ...contentData }
    if (!updated.portfolio.items[itemIndex].founders) {
      updated.portfolio.items[itemIndex].founders = []
    }
    updated.portfolio.items[itemIndex].founders!.push({ name: { zh: "", en: "" }, link: "" })
    setContentData(updated)
  }

  const removePortfolioFounder = (itemIndex: number, founderIndex: number) => {
    if (!contentData) return
    const updated = { ...contentData }
    updated.portfolio.items[itemIndex].founders = updated.portfolio.items[itemIndex].founders?.filter((_, i) => i !== founderIndex)
    setContentData(updated)
  }

  const updatePortfolioFounder = (itemIndex: number, founderIndex: number, lang: string, field: string, value: string) => {
    if (!contentData) return
    const updated = { ...contentData }
    if (field === "link") {
      updated.portfolio.items[itemIndex].founders![founderIndex].link = value
    } else {
      (updated.portfolio.items[itemIndex].founders![founderIndex].name as any)[lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  // ===== 项目操作 =====
  const addProject = () => {
    if (!contentData) return
    const updated = { ...contentData }
    updated.projects.list.push({
      name: { zh: "", en: "" },
      desc: { zh: "", en: "" },
      link: ""
    })
    setContentData(updated)
  }

  const removeProject = (index: number) => {
    if (!contentData) return
    const updated = { ...contentData }
    updated.projects.list = updated.projects.list.filter((_, i) => i !== index)
    setContentData(updated)
  }

  const updateProject = (index: number, lang: string, field: string, value: string) => {
    if (!contentData) return
    const updated = { ...contentData }
    if (field === "link") {
      updated.projects.list[index].link = value
    } else {
      (updated.projects.list[index] as any)[field][lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  // ===== 研究活动操作 =====
  const addResearch = () => {
    if (!contentData) return
    const updated = { ...contentData }
    updated.research.list.push({
      name: { zh: "", en: "" },
      desc: { zh: "", en: "" },
      slug: "",
      intro: { zh: "", en: "" },
      type: "article",  // 默认为图文类型
      articles: []
    })
    setContentData(updated)
  }

  const removeResearch = (index: number) => {
    if (!contentData) return
    const updated = { ...contentData }
    updated.research.list = updated.research.list.filter((_, i) => i !== index)
    setContentData(updated)
  }

  const updateResearch = (index: number, lang: string, field: string, value: string) => {
    if (!contentData) return
    const updated = { ...contentData }
    if (field === "slug") {
      updated.research.list[index].slug = value
    } else if (field === "type") {
      // 更新内容类型
      (updated.research.list[index] as any).type = value
    } else if (field === "intro") {
      (updated.research.list[index].intro as any)[lang] = value
    } else {
      (updated.research.list[index] as any)[field][lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  const addArticle = (researchIndex: number) => {
    if (!contentData) return
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
    if (!contentData) return
    const updated = { ...contentData }
    updated.research.list[researchIndex].articles = updated.research.list[researchIndex].articles.filter((_, i) => i !== articleIndex)
    setContentData(updated)
  }

  const updateArticle = (researchIndex: number, articleIndex: number, lang: string, field: string, value: string) => {
    if (!contentData) return
    const updated = { ...contentData }
    if (field === "slug") {
      updated.research.list[researchIndex].articles[articleIndex].slug = value
    } else if (field === "content") {
      (updated.research.list[researchIndex].articles[articleIndex].content as any)[lang] = value
    } else {
      (updated.research.list[researchIndex].articles[articleIndex] as any)[field][lang] = value
    }
    setContentData(updated)
    markAsChanged()
  }

  const toggleArticleExpand = (researchIndex: number, articleIndex: number) => {
    const key = `${researchIndex}-${articleIndex}`
    setExpandedArticles(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isArticleExpanded = (researchIndex: number, articleIndex: number) => {
    const key = `${researchIndex}-${articleIndex}`
    return expandedArticles[key] || false
  }

  // 研究栏目拖拽排序
  const handleResearchDragEnd = (event: DragEndEvent) => {
    if (!contentData) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = contentData.research.list.findIndex((item) => 
        (item.slug || `item-${contentData.research.list.indexOf(item)}`) === active.id
      )
      const newIndex = contentData.research.list.findIndex((item) => 
        (item.slug || `item-${contentData.research.list.indexOf(item)}`) === over.id
      )
      
      const newList = arrayMove(contentData.research.list, oldIndex, newIndex)
      setContentData({
        ...contentData,
        research: { ...contentData.research, list: newList }
      })
      hasUnsavedChanges.current = true
      
      if (activeResearchIndex === oldIndex) {
        setActiveResearchIndex(newIndex)
      } else if (activeResearchIndex > oldIndex && activeResearchIndex <= newIndex) {
        setActiveResearchIndex(activeResearchIndex - 1)
      } else if (activeResearchIndex < oldIndex && activeResearchIndex >= newIndex) {
        setActiveResearchIndex(activeResearchIndex + 1)
      }
    }
  }

  const toggleResearchHidden = (index: number) => {
    if (!contentData) return
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

  return {
    // 状态
    activeResearchIndex,
    setActiveResearchIndex,
    expandedArticles,
    // 团队
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    // 投资组合
    addPortfolioItem,
    removePortfolioItem,
    updatePortfolioItem,
    addPortfolioFounder,
    removePortfolioFounder,
    updatePortfolioFounder,
    // 项目
    addProject,
    removeProject,
    updateProject,
    // 研究
    addResearch,
    removeResearch,
    updateResearch,
    addArticle,
    removeArticle,
    updateArticle,
    toggleArticleExpand,
    isArticleExpanded,
    handleResearchDragEnd,
    toggleResearchHidden,
  }
}
