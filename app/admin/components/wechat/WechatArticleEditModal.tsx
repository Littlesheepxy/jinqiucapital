"use client"

import { RichTextEditor } from "@/components/rich-text-editor"

interface WechatArticleEditModalProps {
  article: any
  saving: boolean
  saveSuccess: boolean
  onClose: () => void
  onSave: () => void
  onChange: (article: any) => void
}

export function WechatArticleEditModal({
  article,
  saving,
  saveSuccess,
  onClose,
  onSave,
  onChange,
}: WechatArticleEditModalProps) {
  // 图片上传处理
  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error("图片读取失败"))
        }
      }
      reader.onerror = () => reject(new Error("图片读取失败"))
      reader.readAsDataURL(file)
    })
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      animation: "modal-fade-in 0.2s ease-out"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "1000px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "modal-scale-in 0.2s ease-out"
      }}>
        {/* 弹窗头部 */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f8f8"
        }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
            编辑文章
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            关闭
          </button>
        </div>

        {/* 弹窗内容 */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px"
        }}>
          {/* 基本信息 */}
          <div style={{
            backgroundColor: "#f8f8f8",
            padding: "16px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "1px solid #e0e0e0"
          }}>
            <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
              📌 基本信息
            </h4>
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                  文章标题
                </label>
                <input
                  type="text"
                  value={article.title}
                  onChange={(e) => onChange({...article, title: e.target.value})}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    width: "100%"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                  文章描述
                </label>
                <textarea
                  value={article.description || ""}
                  onChange={(e) => onChange({...article, description: e.target.value})}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    width: "100%",
                    minHeight: "80px",
                    resize: "vertical"
                  }}
                  placeholder="简短描述，将显示在文章列表中"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                  封面图片 URL
                </label>
                <input
                  type="text"
                  value={article.cover_image || ""}
                  onChange={(e) => onChange({...article, cover_image: e.target.value})}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    width: "100%"
                  }}
                  placeholder="输入图片 URL 或在下方内容中插入图片"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "13px" }}>
                  分类
                </label>
                <select
                  value={article.category || ""}
                  onChange={(e) => onChange({...article, category: e.target.value})}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    width: "100%"
                  }}
                >
                  <option value="">未分类</option>
                  <option value="jinqiu-select">Jinqiu Select</option>
                  <option value="jinqiu-scan">Jinqiu Scan</option>
                  <option value="jinqiu-spotlight">Jinqiu Spotlight</option>
                  <option value="jinqiu-roundtable">锦秋小饭桌</option>
                  <option value="jinqiu-summit">锦秋会</option>
                </select>
              </div>
            </div>
          </div>

          {/* 文章内容 */}
          <div style={{
            backgroundColor: "#f8f8f8",
            padding: "16px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0"
          }}>
            <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
              📝 文章内容（富文本编辑）
            </h4>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
              💡 提示：点击工具栏的 🖼️ 插入图片 按钮可在文章中插入图片
            </div>
            <RichTextEditor
              value={article.content || ""}
              onChange={(value) => onChange({...article, content: value})}
              placeholder="输入文章内容..."
              minHeight="400px"
              onImageUpload={handleImageUpload}
            />
          </div>
        </div>

        {/* 弹窗底部 */}
        <div style={{
          padding: "20px",
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          backgroundColor: "#f8f8f8"
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: saving ? 0.5 : 1
            }}
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "10px 20px",
              backgroundColor: saveSuccess ? "#28a745" : "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              opacity: saving ? 0.7 : 1,
              minWidth: "120px"
            }}
          >
            {saving ? "保存中..." : saveSuccess ? "✓ 保存成功" : "保存更改"}
          </button>
        </div>
      </div>
    </div>
  )
}
