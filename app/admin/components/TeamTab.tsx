"use client"

import { useAdmin } from "../context/AdminContext"

export function TeamTab() {
  const { state, actions } = useAdmin()
  const { teamData } = state
  const { addTeamMember, removeTeamMember, updateTeamMember } = actions

  return (
    <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>团队成员</h2>
        <button
          onClick={addTeamMember}
          style={{
            padding: "8px 16px",
            backgroundColor: "#225BBA",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          + 添加成员
        </button>
      </div>
      {teamData.map((member, index) => (
        <div key={index} style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <strong>成员 #{index + 1}</strong>
            <button
              onClick={() => removeTeamMember(index)}
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
              placeholder="姓名"
              value={member.name}
              onChange={(e) => updateTeamMember(index, "name", e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            />
            <input
              type="text"
              placeholder="职位（英文）"
              value={member.title}
              onChange={(e) => updateTeamMember(index, "title", e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            />
            <input
              type="text"
              placeholder="个人主页链接（选填）"
              value={member.link || ""}
              onChange={(e) => updateTeamMember(index, "link", e.target.value)}
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
