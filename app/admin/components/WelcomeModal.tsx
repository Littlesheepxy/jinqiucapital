"use client"

import { useAdmin } from "../context/AdminContext"

export function WelcomeModal() {
  const { state, actions } = useAdmin()
  const { showWelcomeModal } = state
  const { setShowWelcomeModal } = actions

  if (!showWelcomeModal) return null

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
  )
}
