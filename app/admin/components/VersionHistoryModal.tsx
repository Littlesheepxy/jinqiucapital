"use client"

import { useState } from "react"
import { useAdmin } from "../context/AdminContext"

export function VersionHistoryModal() {
  const { state, actions } = useAdmin()
  const { showVersionHistory, versionHistory } = state
  const { setShowVersionHistory, restoreVersion, deleteVersion, clearAllVersions } = actions
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  if (!showVersionHistory) return null

  return (
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
                  
                  {/* 版本详情 */}
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
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
