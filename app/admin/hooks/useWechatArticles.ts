"use client"

import { useState } from "react"
import type { WechatArticle } from "../types"

export function useWechatArticles(password: string, setMessage: (msg: string) => void) {
  const [wechatArticles, setWechatArticles] = useState<WechatArticle[]>([])
  const [wechatLoading, setWechatLoading] = useState(false)
  const [wechatError, setWechatError] = useState<string | null>(null)
  const [editingArticle, setEditingArticle] = useState<WechatArticle | null>(null)
  const [wechatCategoryFilter, setWechatCategoryFilter] = useState<string>("all")
  const [wechatSearchQuery, setWechatSearchQuery] = useState<string>("")
  const [savingArticle, setSavingArticle] = useState(false)
  const [saveArticleSuccess, setSaveArticleSuccess] = useState(false)

  // 加载文章列表
  const loadWechatArticles = async (overrideCategory?: string, overrideSearch?: string) => {
    try {
      setWechatLoading(true)
      setWechatError(null)

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

  // 保存文章
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

  // 删除文章
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

  // 切换隐藏状态
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

  return {
    // 状态
    wechatArticles,
    wechatLoading,
    wechatError,
    editingArticle,
    setEditingArticle,
    wechatCategoryFilter,
    setWechatCategoryFilter,
    wechatSearchQuery,
    setWechatSearchQuery,
    savingArticle,
    saveArticleSuccess,
    // 方法
    loadWechatArticles,
    saveWechatArticle,
    deleteWechatArticle,
    toggleWechatArticleHidden,
  }
}
