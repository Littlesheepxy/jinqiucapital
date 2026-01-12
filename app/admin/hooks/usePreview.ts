"use client"

import { useState } from "react"
import type { Language, PreviewType, ContentData } from "../types"

export function usePreview(contentData: ContentData | null) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewLanguage, setPreviewLanguage] = useState<Language>("zh")
  const [previewType, setPreviewType] = useState<PreviewType>("intro")
  const [previewResearchIndex, setPreviewResearchIndex] = useState(0)
  const [previewArticleIndex, setPreviewArticleIndex] = useState(0)

  const updatePreview = (content: string, type: PreviewType, researchIdx?: number, articleIdx?: number) => {
    setPreviewContent(content)
    setPreviewType(type)
    if (researchIdx !== undefined) setPreviewResearchIndex(researchIdx)
    if (articleIdx !== undefined) setPreviewArticleIndex(articleIdx)
    if (!showPreview) {
      setShowPreview(true)
    }
  }

  const openPreviewInNewTab = () => {
    if (!contentData) return
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

  return {
    showPreview,
    setShowPreview,
    previewContent,
    previewLanguage,
    setPreviewLanguage,
    previewType,
    previewResearchIndex,
    previewArticleIndex,
    updatePreview,
    openPreviewInNewTab,
  }
}
