"use client"

import { useState } from "react"
import { useAdmin } from "../context/AdminContext"
import { RichTextEditor } from "@/components/rich-text-editor"

export function ProjectsTab() {
  const { state, actions } = useAdmin()
  const { contentData } = state
  const { addProject, removeProject, updateProject, markAsChanged, setContentData } = actions
  const [expandedProject, setExpandedProject] = useState<number | null>(null)

  if (!contentData) return null

  // 更新项目详情页内容
  const updateProjectPageContent = (index: number, lang: string, field: string, value: string) => {
    const newData = { ...contentData }
    if (!newData.projects.list[index].pageContent) {
      newData.projects.list[index].pageContent = { zh: "", en: "" }
    }
    if (lang) {
      newData.projects.list[index].pageContent[lang] = value
    }
    setContentData(newData)
    markAsChanged()
  }

  // 更新项目 slug
  const updateProjectSlug = (index: number, value: string) => {
    const newData = { ...contentData }
    newData.projects.list[index].slug = value
    setContentData(newData)
    markAsChanged()
  }

  return (
    <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>项目列表</h2>
        <button
          onClick={addProject}
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
      {contentData.projects.list.map((project: any, index: number) => (
        <div key={index} style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <strong>项目 #{index + 1}: {project.name.zh || "未命名"}</strong>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setExpandedProject(expandedProject === index ? null : index)}
                style={{
                  padding: "4px 12px",
                  backgroundColor: expandedProject === index ? "#17a2b8" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                {expandedProject === index ? "收起详情页" : "编辑详情页"}
              </button>
              <button
                onClick={() => removeProject(index)}
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
          </div>
          
          {/* 基本信息 */}
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input
                type="text"
                placeholder="项目名称（中文）"
                value={project.name.zh}
                onChange={(e) => updateProject(index, "zh", "name", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
              <input
                type="text"
                placeholder="项目名称（英文）"
                value={project.name.en}
                onChange={(e) => updateProject(index, "en", "name", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <textarea
                placeholder="项目描述（中文）- 显示在首页"
                value={project.desc.zh}
                onChange={(e) => updateProject(index, "zh", "desc", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "60px"
                }}
              />
              <textarea
                placeholder="项目描述（英文）- 显示在首页"
                value={project.desc.en}
                onChange={(e) => updateProject(index, "en", "desc", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "60px"
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input
                type="text"
                placeholder="项目链接（外部链接）"
                value={project.link || ""}
                onChange={(e) => updateProject(index, "", "link", e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
              <input
                type="text"
                placeholder="页面路径 slug（如: soil，留空则使用外部链接）"
                value={project.slug || ""}
                onChange={(e) => updateProjectSlug(index, e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
            </div>
            {project.slug && (
              <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>
                📄 详情页地址: <a href={`/${project.slug}`} target="_blank" style={{ color: "#225BBA" }}>/{project.slug}</a>
              </p>
            )}
          </div>

          {/* 详情页内容编辑 */}
          {expandedProject === index && (
            <div style={{ 
              marginTop: "20px", 
              paddingTop: "20px", 
              borderTop: "1px solid #eee" 
            }}>
              <h4 style={{ marginBottom: "12px", color: "#225BBA" }}>
                📝 详情页内容（富文本）
              </h4>
              <p style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>
                编辑项目的详情页内容，支持富文本格式。如果设置了 slug，访问 /{project.slug || "slug"} 将显示此内容。
              </p>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontWeight: "bold",
                  fontSize: "14px"
                }}>
                  中文内容
                </label>
                <RichTextEditor
                  value={project.pageContent?.zh || ""}
                  onChange={(value) => updateProjectPageContent(index, "zh", "content", value)}
                  placeholder="输入项目详情页的中文内容..."
                  minHeight="300px"
                />
              </div>
              
              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontWeight: "bold",
                  fontSize: "14px"
                }}>
                  英文内容
                </label>
                <RichTextEditor
                  value={project.pageContent?.en || ""}
                  onChange={(value) => updateProjectPageContent(index, "en", "content", value)}
                  placeholder="Enter project detail page content in English..."
                  minHeight="300px"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
