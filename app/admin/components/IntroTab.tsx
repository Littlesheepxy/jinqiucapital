"use client"

import { RichTextEditor } from "@/components/rich-text-editor"
import { useAdmin } from "../context/AdminContext"

export function IntroTab() {
  const { state, actions } = useAdmin()
  const { contentData, previewLanguage } = state
  const { setContentData, updatePreview, markAsChanged } = actions

  if (!contentData) return null

  return (
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
            markAsChanged()
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
            markAsChanged()
          }}
          placeholder="Enter brand introduction (English)..."
          minHeight="250px"
        />
      </div>
    </div>
  )
}
