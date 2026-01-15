"use client"

import { useAdmin } from "../context/AdminContext"

export function TeamTab() {
  const { state, actions } = useAdmin()
  const { teamData } = state
  const { addTeamMember, removeTeamMember, updateTeamMember } = actions

  // 兼容旧数据格式：如果 name 是字符串，转换为对象格式
  const getNameZh = (member: any) => {
    if (typeof member.name === 'object') return member.name?.zh || ''
    return member.name || ''
  }
  const getNameEn = (member: any) => {
    if (typeof member.name === 'object') return member.name?.en || ''
    return member.name_en || ''
  }

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
            {/* 姓名（中英文） */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                  姓名（中文）
                </label>
                <input
                  type="text"
                  placeholder="如：杨洁"
                  value={getNameZh(member)}
                  onChange={(e) => updateTeamMember(index, "name_zh", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                  姓名（英文）
                </label>
                <input
                  type="text"
                  placeholder="如：Jie Yang"
                  value={getNameEn(member)}
                  onChange={(e) => updateTeamMember(index, "name_en", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
            {/* 职位（中英文） */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                  职位（中文）
                </label>
                <input
                  type="text"
                  placeholder="如：创始合伙人"
                  value={member.title_zh || ""}
                  onChange={(e) => updateTeamMember(index, "title_zh", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>
                  职位（英文）
                </label>
                <input
                  type="text"
                  placeholder="如：Founding Partner"
                  value={member.title || ""}
                  onChange={(e) => updateTeamMember(index, "title", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
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
