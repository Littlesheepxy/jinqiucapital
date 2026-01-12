"use client"

const CATEGORIES = [
  { value: "all", label: "全部" },
  { value: "jinqiu-spotlight", label: "Spotlight" },
  { value: "jinqiu-select", label: "Select" },
  { value: "jinqiu-lab", label: "AI实验室" },
  { value: "jinqiu-roundtable", label: "小饭桌" },
  { value: "jinqiu-summit", label: "锦秋会" },
]

const CATEGORY_LABELS: Record<string, string> = {
  "jinqiu-spotlight": "Jinqiu Spotlight",
  "jinqiu-select": "Jinqiu Select",
  "jinqiu-lab": "锦秋AI实验室",
  "jinqiu-roundtable": "锦秋小饭桌",
  "jinqiu-summit": "锦秋会",
}

interface WechatCategoryFilterProps {
  categoryFilter: string
  searchQuery: string
  articleCount: number
  loading: boolean
  onCategoryChange: (category: string) => void
  onSearchChange: (query: string) => void
  onSearch: () => void
  onReset: () => void
}

export function WechatCategoryFilter({
  categoryFilter,
  searchQuery,
  articleCount,
  loading,
  onCategoryChange,
  onSearchChange,
  onSearch,
  onReset,
}: WechatCategoryFilterProps) {
  return (
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
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              style={{
                padding: "6px 12px",
                backgroundColor: categoryFilter === cat.value ? "#225BBA" : "white",
                color: categoryFilter === cat.value ? "white" : "#666",
                border: `1px solid ${categoryFilter === cat.value ? "#225BBA" : "#ddd"}`,
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: categoryFilter === cat.value ? "bold" : "normal",
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
            placeholder={categoryFilter === "all" 
              ? "在全部文章中搜索..." 
              : `在当前分类中搜索...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch()
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
            onClick={onSearch}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            🔍 搜索
          </button>
          {(searchQuery || categoryFilter !== "all") && (
            <button
              onClick={onReset}
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
          {categoryFilter === "all" ? "全部分类" : CATEGORY_LABELS[categoryFilter] || categoryFilter}
        </span>
        {searchQuery && (
          <>
            <span>→</span>
            <span>关键词 "<strong>{searchQuery}</strong>"</span>
          </>
        )}
        <span style={{ marginLeft: "auto" }}>
          共 {articleCount} 篇文章
        </span>
      </div>
    </div>
  )
}
