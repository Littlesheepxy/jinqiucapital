"use client"

import { RichTextEditor } from "@/components/rich-text-editor"
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem, VisibilityToggle } from "@/components/sortable-item"
import { useAdmin } from "../context/AdminContext"

export function ResearchTab() {
  const { state, actions, sensors } = useAdmin()
  const { contentData, activeResearchIndex, previewLanguage } = state
  const { 
    setActiveResearchIndex,
    addResearch,
    removeResearch,
    updateResearch,
    addArticle,
    removeArticle,
    updateArticle,
    toggleArticleExpand,
    isArticleExpanded,
    handleResearchDragEnd,
    toggleResearchHidden,
    updatePreview,
  } = actions

  if (!contentData) return null

  return (
    <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>研究与活动</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#666" }}>💡 拖拽标签可排序</span>
          <button
            onClick={addResearch}
            style={{
              padding: "8px 16px",
              backgroundColor: "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            + 添加项目
          </button>
        </div>
      </div>

      {/* 项目切换标签 - 支持拖拽排序 */}
      {contentData.research.list.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleResearchDragEnd}
        >
          <SortableContext
            items={contentData.research.list.map((item: any, i: number) => item.slug || `item-${i}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div style={{
              display: "flex",
              gap: "4px",
              marginBottom: "20px",
              borderBottom: "2px solid #e0e0e0",
              flexWrap: "wrap",
              paddingBottom: "8px"
            }}>
              {contentData.research.list.map((item: any, index: number) => (
                <SortableItem key={item.slug || `item-${index}`} id={item.slug || `item-${index}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      onClick={() => setActiveResearchIndex(index)}
                      style={{
                        padding: "10px 16px",
                        backgroundColor: activeResearchIndex === index ? "#225BBA" : item.hidden ? "#f0f0f0" : "transparent",
                        color: activeResearchIndex === index ? "white" : item.hidden ? "#999" : "#666",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: activeResearchIndex === index ? "bold" : "normal",
                        fontSize: "14px",
                        borderRadius: "4px",
                        transition: "all 0.2s",
                        textDecoration: item.hidden ? "line-through" : "none",
                        opacity: item.hidden ? 0.6 : 1,
                      }}
                    >
                      {item.hidden && "🙈 "}
                      {item.type === "video" ? "📹 " : "📖 "}
                      {item.name.zh || `项目 ${index + 1}`}
                    </button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 当前选中的项目 */}
      {contentData.research.list.length > 0 && contentData.research.list[activeResearchIndex] && (() => {
        const item = contentData.research.list[activeResearchIndex]
        const index = activeResearchIndex
        return (
          <div key={index} style={{
            border: item.hidden ? "2px dashed #ccc" : "2px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            backgroundColor: item.hidden ? "#f9f9f9" : "#fafafa",
            opacity: item.hidden ? 0.8 : 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ fontSize: "16px" }}>项目 #{index + 1}</strong>
                <VisibilityToggle
                  hidden={item.hidden || false}
                  onChange={() => toggleResearchHidden(index)}
                />
              </div>
              <button
                onClick={() => removeResearch(index)}
                style={{
                  padding: "4px 12px",
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
            
            {item.hidden && (
              <div style={{
                padding: "8px 12px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#856404"
              }}>
                ⚠️ 此栏目已隐藏，不会在前台显示
              </div>
            )}
            
            {/* 基本信息 */}
            <div style={{ 
              backgroundColor: "white", 
              padding: "16px", 
              borderRadius: "6px", 
              marginBottom: "16px",
              border: "1px solid #e0e0e0"
            }}>
              <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                📌 基本信息
              </h4>
              <div style={{ display: "grid", gap: "12px" }}>
                {/* 内容类型选择 */}
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500" }}>
                    内容类型
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <label style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px",
                      padding: "10px 16px",
                      border: item.type !== "video" ? "2px solid #225BBA" : "2px solid #ddd",
                      borderRadius: "6px",
                      cursor: "pointer",
                      backgroundColor: item.type !== "video" ? "#e8f4fd" : "white",
                    }}>
                      <input
                        type="radio"
                        name={`type-${index}`}
                        checked={item.type !== "video"}
                        onChange={() => updateResearch(index, "", "type", "article")}
                        style={{ display: "none" }}
                      />
                      <span style={{ fontSize: "18px" }}>📖</span>
                      <span style={{ fontSize: "14px", fontWeight: item.type !== "video" ? "bold" : "normal" }}>
                        图文（微信公众号）
                      </span>
                    </label>
                    <label style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px",
                      padding: "10px 16px",
                      border: item.type === "video" ? "2px solid #225BBA" : "2px solid #ddd",
                      borderRadius: "6px",
                      cursor: "pointer",
                      backgroundColor: item.type === "video" ? "#e8f4fd" : "white",
                    }}>
                      <input
                        type="radio"
                        name={`type-${index}`}
                        checked={item.type === "video"}
                        onChange={() => updateResearch(index, "", "type", "video")}
                        style={{ display: "none" }}
                      />
                      <span style={{ fontSize: "18px" }}>📹</span>
                      <span style={{ fontSize: "14px", fontWeight: item.type === "video" ? "bold" : "normal" }}>
                        视频（B站）
                      </span>
                    </label>
                  </div>
                  <p style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
                    {item.type === "video" 
                      ? "💡 视频内容请在「视频管理」Tab 中添加" 
                      : "💡 图文内容来自微信公众号抓取，在「微信文章」Tab 中管理"}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="名称（中文）"
                  value={item.name.zh}
                  onChange={(e) => updateResearch(index, "zh", "name", e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                <input
                  type="text"
                  placeholder="名称（英文）"
                  value={item.name.en}
                  onChange={(e) => updateResearch(index, "en", "name", e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
                <textarea
                  placeholder="简短描述（中文）- 显示在列表"
                  value={item.desc.zh}
                  onChange={(e) => updateResearch(index, "zh", "desc", e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    minHeight: "60px",
                    fontSize: "14px"
                  }}
                />
                <textarea
                  placeholder="简短描述（英文）- 显示在列表"
                  value={item.desc.en}
                  onChange={(e) => updateResearch(index, "en", "desc", e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    minHeight: "60px",
                    fontSize: "14px"
                  }}
                />
                <input
                  type="text"
                  placeholder="URL Slug（英文，如: jinqiu-select 或 videos）"
                  value={item.slug || ""}
                  onChange={(e) => updateResearch(index, "", "slug", e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "monospace"
                  }}
                />
                {item.slug && (
                  <div style={{ fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                    页面链接: /library/{item.slug}
                  </div>
                )}
              </div>
            </div>

            {/* 页面介绍 - 富文本编辑 */}
            <div style={{ 
              backgroundColor: "white", 
              padding: "16px", 
              borderRadius: "6px",
              marginBottom: "16px",
              border: "1px solid #e0e0e0"
            }}>
              <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                📝 页面顶部介绍（富文本）
              </h4>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                  中文介绍
                </label>
                <RichTextEditor
                  value={item.intro?.zh || ""}
                  onChange={(value) => {
                    updateResearch(index, "zh", "intro", value)
                    if (previewLanguage === "zh") updatePreview(value, "research-intro", index)
                  }}
                  placeholder="输入页面顶部介绍（中文）..."
                  minHeight="200px"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "13px" }}>
                  英文介绍
                </label>
                <RichTextEditor
                  value={item.intro?.en || ""}
                  onChange={(value) => {
                    updateResearch(index, "en", "intro", value)
                    if (previewLanguage === "en") updatePreview(value, "research-intro", index)
                  }}
                  placeholder="Enter page intro (English)..."
                  minHeight="200px"
                />
              </div>
            </div>

            {/* 视频类型提示 */}
            {item.type === "video" && (
              <div style={{ 
                backgroundColor: "#e8f4fd", 
                padding: "20px", 
                borderRadius: "6px",
                border: "1px solid #b8daff",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📹</div>
                <h4 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", color: "#225BBA" }}>
                  这是一个视频类型的项目
                </h4>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                  请前往「📹 视频」Tab 添加和管理视频内容
                </p>
                <button
                  onClick={() => actions.setActiveTab("videos")}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#225BBA",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}
                >
                  前往视频管理 →
                </button>
              </div>
            )}

            {/* 文章列表 - 仅图文类型显示 */}
            {item.type !== "video" && (
              <div style={{ 
                backgroundColor: "white", 
                padding: "16px", 
                borderRadius: "6px",
                border: "1px solid #e0e0e0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#225BBA" }}>
                    📚 文章列表（手动添加）
                  </h4>
                  <button
                    onClick={() => addArticle(index)}
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
                    + 添加文章
                  </button>
                </div>

                <div style={{
                  padding: "12px",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffc107",
                  borderRadius: "4px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#856404"
                }}>
                  💡 图文内容主要来自微信公众号自动抓取。如需手动添加文章，可在下方操作。
                  <br />
                  微信文章请在「微信文章」Tab 中管理。
                </div>
                
                {item.articles && item.articles.length > 0 ? (
                  item.articles.map((article: any, articleIndex: number) => {
                    const isExpanded = isArticleExpanded(index, articleIndex)
                    return (
                      <div key={articleIndex} style={{
                        backgroundColor: "#f9f9f9",
                        padding: "16px",
                        borderRadius: "4px",
                        marginBottom: "12px",
                        border: "1px solid #e8e8e8"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isExpanded ? "12px" : "0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                            <button
                              onClick={() => toggleArticleExpand(index, articleIndex)}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "transparent",
                                border: "1px solid #ddd",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title={isExpanded ? "折叠" : "展开"}
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#666" }}>
                              文章 #{articleIndex + 1}: {article.title?.zh || article.title?.en || "未命名"}
                            </span>
                          </div>
                          <button
                            onClick={() => removeArticle(index, articleIndex)}
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "11px"
                            }}
                          >
                            删除
                          </button>
                        </div>
                        
                        {isExpanded && (
                          <>
                            {/* 文章基本信息 */}
                            <div style={{ display: "grid", gap: "10px", marginBottom: "12px" }}>
                              <input
                                type="text"
                                placeholder="文章标题（中文）"
                                value={article.title?.zh || ""}
                                onChange={(e) => updateArticle(index, articleIndex, "zh", "title", e.target.value)}
                                style={{
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  fontSize: "13px"
                                }}
                              />
                              <input
                                type="text"
                                placeholder="文章标题（英文）"
                                value={article.title?.en || ""}
                                onChange={(e) => updateArticle(index, articleIndex, "en", "title", e.target.value)}
                                style={{
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  fontSize: "13px"
                                }}
                              />
                              <input
                                type="text"
                                placeholder="文章URL Slug（英文，如: article-1）"
                                value={article.slug || ""}
                                onChange={(e) => updateArticle(index, articleIndex, "", "slug", e.target.value)}
                                style={{
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  fontSize: "13px",
                                  fontFamily: "monospace"
                                }}
                              />
                              {item.slug && article.slug && (
                                <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>
                                  文章链接: /library/{item.slug}/{article.slug}
                                </div>
                              )}
                            </div>

                            {/* 文章内容 */}
                            <div style={{ marginTop: "12px" }}>
                              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "12px" }}>
                                文章内容（中文）
                              </label>
                              <RichTextEditor
                                value={article.content?.zh || ""}
                                onChange={(value) => {
                                  updateArticle(index, articleIndex, "zh", "content", value)
                                  if (previewLanguage === "zh") updatePreview(value, "research-article", index, articleIndex)
                                }}
                                placeholder="输入文章内容（中文）..."
                                minHeight="250px"
                              />
                            </div>
                            <div style={{ marginTop: "12px" }}>
                              <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "12px" }}>
                                文章内容（英文）
                              </label>
                              <RichTextEditor
                                value={article.content?.en || ""}
                                onChange={(value) => {
                                  updateArticle(index, articleIndex, "en", "content", value)
                                  if (previewLanguage === "en") updatePreview(value, "research-article", index, articleIndex)
                                }}
                                placeholder="Enter article content (English)..."
                                minHeight="250px"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p style={{ color: "#999", fontSize: "13px", fontStyle: "italic" }}>
                    暂无手动添加的文章
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
