"use client"

import { useState, useEffect } from "react"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [contentData, setContentData] = useState<any>(null)
  const [teamData, setTeamData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"about" | "team" | "projects" | "research">("about")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  // 加载数据
  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/content")
      const data = await response.json()
      setContentData(data.content)
      setTeamData(data.team)
    } catch (error) {
      setMessage("加载数据失败")
    }
  }

  // 登录验证
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 尝试用密码保存一个空数据来验证
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, content: null, team: null })
      })

      if (response.ok) {
        setIsAuthenticated(true)
        loadData()
      } else {
        setMessage("密码错误")
      }
    } catch (error) {
      setMessage("验证失败")
    }
  }

  // 保存数据
  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          content: contentData,
          team: teamData
        })
      })

      const result = await response.json()

      if (response.ok) {
        const saveMethod = result.edgeConfigUpdated ? 'Edge Config (生产环境)' : 'JSON 文件 (本地)'
        setMessage(`✓ 保存成功到 ${saveMethod}！`)
        setTimeout(() => setMessage(""), 3000)
        
        // 等待一小段时间让 Edge Config 传播，然后重新加载验证
        setTimeout(() => loadData(), 1000)
      } else {
        const errorDetails = result.details ? `: ${result.details}` : ''
        setMessage(`保存失败${errorDetails}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setSaving(false)
    }
  }

  // 登录界面
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px"
        }}>
          <h1 style={{ marginBottom: "30px", fontSize: "24px", fontWeight: "bold" }}>
            锦秋基金 - 管理后台
          </h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
                管理员密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                placeholder="请输入密码"
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#225BBA",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              登录
            </button>
            {message && (
              <p style={{ marginTop: "15px", color: "red", fontSize: "14px" }}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    )
  }

  // 管理界面
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* 顶部栏 */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>锦秋基金 - 内容管理</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {message && (
            <span style={{ 
              fontSize: "14px", 
              color: message.includes("✓") ? "green" : "red" 
            }}>
              {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px",
              backgroundColor: "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              padding: "8px 20px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            退出
          </button>
        </div>
      </div>

      {/* 标签页 */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        padding: "0 30px"
      }}>
        <div style={{ display: "flex", gap: "30px" }}>
          {["about", "team", "projects", "research"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: "15px 0",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? "#225BBA" : "#666",
                borderBottom: activeTab === tab ? "2px solid #225BBA" : "none",
                cursor: "pointer"
              }}
            >
              {tab === "about" && "关于锦秋"}
              {tab === "team" && "团队"}
              {tab === "projects" && "项目矩阵"}
              {tab === "research" && "研究与活动"}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
        {contentData && (
          <>
            {/* 关于锦秋 */}
            {activeTab === "about" && (
              <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
                  关于锦秋 - 内容编辑
                </h2>
                {contentData.about.paragraphs.map((para: any, index: number) => (
                  <div key={index} style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
                      段落 {index + 1} - 中文
                    </label>
                    <textarea
                      value={para.zh}
                      onChange={(e) => {
                        const newData = { ...contentData }
                        newData.about.paragraphs[index].zh = e.target.value
                        setContentData(newData)
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        minHeight: "80px",
                        fontFamily: "inherit",
                        marginBottom: "10px"
                      }}
                    />
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
                      段落 {index + 1} - English
                    </label>
                    <textarea
                      value={para.en}
                      onChange={(e) => {
                        const newData = { ...contentData }
                        newData.about.paragraphs[index].en = e.target.value
                        setContentData(newData)
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        minHeight: "80px",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 团队 */}
            {activeTab === "team" && (
              <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
                  团队成员管理
                </h2>
                {teamData.map((member, index) => (
                  <div key={index} style={{
                    marginBottom: "20px",
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>姓名</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const newData = [...teamData]
                            newData[index].name = e.target.value
                            setTeamData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>英文职位</label>
                        <input
                          type="text"
                          value={member.title}
                          onChange={(e) => {
                            const newData = [...teamData]
                            newData[index].title = e.target.value
                            setTeamData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>中文职位</label>
                        <input
                          type="text"
                          value={member.title_zh}
                          onChange={(e) => {
                            const newData = [...teamData]
                            newData[index].title_zh = e.target.value
                            setTeamData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
                          个人链接（可选）
                        </label>
                        <input
                          type="url"
                          value={member.link || ""}
                          onChange={(e) => {
                            const newData = [...teamData]
                            newData[index].link = e.target.value
                            setTeamData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 项目矩阵 */}
            {activeTab === "projects" && (
              <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
                  项目矩阵管理
                </h2>
                {contentData.projects.map((project: any, index: number) => (
                  <div key={index} style={{
                    marginBottom: "20px",
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>项目名称（中文）</label>
                        <input
                          type="text"
                          value={project.name.zh}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.projects[index].name.zh = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>项目名称（English）</label>
                        <input
                          type="text"
                          value={project.name.en}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.projects[index].name.en = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>描述（中文）</label>
                        <input
                          type="text"
                          value={project.description.zh}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.projects[index].description.zh = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>描述（English）</label>
                        <input
                          type="text"
                          value={project.description.en}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.projects[index].description.en = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>项目链接</label>
                        <input
                          type="url"
                          value={project.link}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.projects[index].link = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 研究与活动 */}
            {activeTab === "research" && (
              <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
                  研究与活动管理
                </h2>
                {contentData.research.map((item: any, index: number) => (
                  <div key={index} style={{
                    marginBottom: "20px",
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>项目名称</label>
                        <input
                          type="text"
                          value={typeof item.name === "string" ? item.name : item.name.zh}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            if (typeof item.name === "string") {
                              newData.research[index].name = e.target.value
                            } else {
                              newData.research[index].name.zh = e.target.value
                            }
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>描述（中文）</label>
                        <input
                          type="text"
                          value={item.description.zh}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.research[index].description.zh = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>描述（English）</label>
                        <input
                          type="text"
                          value={item.description.en}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.research[index].description.en = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>链接（可选）</label>
                        <input
                          type="url"
                          value={item.link || ""}
                          onChange={(e) => {
                            const newData = { ...contentData }
                            newData.research[index].link = e.target.value
                            setContentData(newData)
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px"
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

