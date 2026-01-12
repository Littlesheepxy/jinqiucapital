"use client"

import { useAdmin } from "../context/AdminContext"

export function AdminHeader() {
  const { state, actions, hasUnsavedChanges } = useAdmin()
  const { saving, message, autoSaving, lastSaved } = state
  const { handleSave, setShowVersionHistory } = actions

  return (
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
            color: message.includes("成功") || message.includes("✓") ? "green" : "red",
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
          🕐 版本历史
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
          {saving ? "保存中..." : "💾 保存"}
        </button>
      </div>
    </div>
  )
}
