"use client"

import { useAdmin } from "../context/AdminContext"

export function ProjectsTab() {
  const { state, actions } = useAdmin()
  const { contentData } = state
  const { addProject, removeProject, updateProject } = actions

  if (!contentData) return null

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
            <strong>项目 #{index + 1}</strong>
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
          <div style={{ display: "grid", gap: "12px" }}>
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
            <textarea
              placeholder="项目描述（中文）"
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
              placeholder="项目描述（英文）"
              value={project.desc.en}
              onChange={(e) => updateProject(index, "en", "desc", e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "60px"
              }}
            />
            <input
              type="text"
              placeholder="项目链接"
              value={project.link}
              onChange={(e) => updateProject(index, "", "link", e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
