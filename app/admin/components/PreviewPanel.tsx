"use client"

import { useAdmin } from "../context/AdminContext"

export function PreviewPanel() {
  const { state, actions } = useAdmin()
  const { showPreview, previewContent, previewLanguage, contentData } = state
  const { setShowPreview, setPreviewLanguage, openPreviewInNewTab } = actions

  if (!showPreview) return null

  return (
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
                {(contentData as any)?.settings?.brandName?.[previewLanguage] || "锦秋基金"}
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
  )
}
