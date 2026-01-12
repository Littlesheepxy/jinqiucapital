"use client"

import { useAdmin } from "../context/AdminContext"
import type { AdminTab } from "../types"

const tabs: { key: AdminTab; label: string }[] = [
  { key: "intro", label: "品牌介绍" },
  { key: "team", label: "团队" },
  { key: "portfolio", label: "投资组合" },
  { key: "projects", label: "项目" },
  { key: "research", label: "研究与活动" },
  { key: "wechat-articles", label: "微信文章" },
  { key: "videos", label: "📹 视频" }
]

export function TabNavigation() {
  const { state, actions } = useAdmin()
  const { activeTab } = state
  const { setActiveTab } = actions

  return (
    <div style={{
      display: "flex",
      gap: "8px",
      marginBottom: "24px",
      borderBottom: "2px solid #e0e0e0",
      paddingBottom: "16px"
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            padding: "12px 20px",
            backgroundColor: activeTab === tab.key ? "#225BBA" : "white",
            color: activeTab === tab.key ? "white" : "#666",
            border: activeTab === tab.key ? "none" : "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: activeTab === tab.key ? "bold" : "normal",
            fontSize: "14px",
            transition: "all 0.2s"
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
