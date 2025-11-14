"use client"

import { useState, useEffect } from "react"
import { RichTextEditor } from "@/components/rich-text-editor"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [contentData, setContentData] = useState<any>(null)
  const [teamData, setTeamData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"intro" | "team" | "portfolio" | "projects" | "research">("intro")
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
        setMessage(`✓ 保存成功到 ${saveMethod}！正在验证...`)
        
        // Edge Config 需要时间传播，等待更长时间
        if (result.edgeConfigUpdated) {
          // 等待 3 秒让 Edge Config 传播
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // 重新加载验证
          await loadData()
          setMessage(`✓ 保存成功并已验证！`)
        } else {
          // 本地保存，立即重新加载
          await loadData()
          setMessage(`✓ 保存成功！`)
        }
        
        setTimeout(() => setMessage(""), 5000)
      } else {
        const errorDetails = result.details ? `: ${result.details}` : ''
        setMessage(`❌ 保存失败${errorDetails}`)
        console.error('Save failed:', result)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage(`❌ 保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setSaving(false)
    }
  }

  // ===== 团队成员操作 =====
  const addTeamMember = () => {
    setTeamData([...teamData, { name: "", title: "", link: "" }])
  }

  const removeTeamMember = (index: number) => {
    setTeamData(teamData.filter((_, i) => i !== index))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamData]
    updated[index] = { ...updated[index], [field]: value }
    setTeamData(updated)
  }

  // ===== 投资组合操作 =====
  const addPortfolioItem = () => {
    const updated = { ...contentData }
    updated.portfolio.items.push({ name: { zh: "", en: "" }, link: "" })
    setContentData(updated)
  }

  const removePortfolioItem = (index: number) => {
    const updated = { ...contentData }
    updated.portfolio.items = updated.portfolio.items.filter((_: any, i: number) => i !== index)
    setContentData(updated)
  }

  const updatePortfolioItem = (index: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "link") {
      updated.portfolio.items[index].link = value
    } else {
      updated.portfolio.items[index].name[lang] = value
    }
    setContentData(updated)
  }

  // ===== 项目操作 =====
  const addProject = () => {
    const updated = { ...contentData }
    updated.projects.list.push({
      name: { zh: "", en: "" },
      desc: { zh: "", en: "" },
      link: ""
    })
    setContentData(updated)
  }

  const removeProject = (index: number) => {
    const updated = { ...contentData }
    updated.projects.list = updated.projects.list.filter((_: any, i: number) => i !== index)
    setContentData(updated)
  }

  const updateProject = (index: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "link") {
      updated.projects.list[index].link = value
    } else {
      updated.projects.list[index][field][lang] = value
    }
    setContentData(updated)
  }

  // ===== 研究活动操作 =====
  const addResearch = () => {
    const updated = { ...contentData }
    updated.research.list.push({
      name: { zh: "", en: "" },
      desc: { zh: "", en: "" },
      link: ""
    })
    setContentData(updated)
  }

  const removeResearch = (index: number) => {
    const updated = { ...contentData }
    updated.research.list = updated.research.list.filter((_: any, i: number) => i !== index)
    setContentData(updated)
  }

  const updateResearch = (index: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "link") {
      updated.research.list[index].link = value
    } else {
      updated.research.list[index][field][lang] = value
    }
    setContentData(updated)
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
          <h1 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "bold" }}>
            管理后台登录
          </h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="请输入管理密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
            />
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
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              登录
            </button>
          </form>
          {message && (
            <div style={{ marginTop: "16px", color: "red", textAlign: "center" }}>
              {message}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!contentData) {
    return <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* 顶部栏 */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>锦秋基金 - 内容管理</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {message && (
            <span style={{
              color: message.includes("成功") ? "green" : "red",
              fontSize: "14px"
            }}>
              {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px",
              backgroundColor: saving ? "#ccc" : "#225BBA",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {saving ? "保存中..." : "保存所有更改"}
          </button>
        </div>
      </div>

      {/* 标签导航 */}
      <div style={{
        backgroundColor: "white",
        borderBottom: "1px solid #ddd",
        padding: "0 24px",
        display: "flex",
        gap: "24px"
      }}>
        {[
          { key: "intro", label: "品牌介绍" },
          { key: "team", label: "团队" },
          { key: "portfolio", label: "投资组合" },
          { key: "projects", label: "项目" },
          { key: "research", label: "研究与活动" }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "16px 0",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #225BBA" : "2px solid transparent",
              color: activeTab === tab.key ? "#225BBA" : "#666",
              fontWeight: activeTab === tab.key ? "bold" : "normal",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* ===== 品牌介绍 ===== */}
        {activeTab === "intro" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px" }}>
              品牌介绍（富文本编辑）
            </h2>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                中文介绍
              </label>
              <RichTextEditor
                value={contentData.about.intro.zh}
                onChange={(value) => {
                  const updated = { ...contentData }
                  updated.about.intro.zh = value
                  setContentData(updated)
                }}
                placeholder="输入品牌介绍（中文）..."
                minHeight="250px"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                英文介绍
              </label>
              <RichTextEditor
                value={contentData.about.intro.en}
                onChange={(value) => {
                  const updated = { ...contentData }
                  updated.about.intro.en = value
                  setContentData(updated)
                }}
                placeholder="Enter brand introduction (English)..."
                minHeight="250px"
              />
            </div>
          </div>
        )}

        {/* ===== 团队 ===== */}
        {activeTab === "team" && (
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
        )}

        {/* ===== 投资组合 ===== */}
        {activeTab === "portfolio" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>描述文本</h3>
              <input
                type="text"
                placeholder="中文描述"
                value={contentData.portfolio.desc.zh}
                onChange={(e) => {
                  const updated = { ...contentData }
                  updated.portfolio.desc.zh = e.target.value
                  setContentData(updated)
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginBottom: "8px"
                }}
              />
              <input
                type="text"
                placeholder="英文描述"
                value={contentData.portfolio.desc.en}
                onChange={(e) => {
                  const updated = { ...contentData }
                  updated.portfolio.desc.en = e.target.value
                  setContentData(updated)
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "bold" }}>投资项目列表</h3>
              <button
                onClick={addPortfolioItem}
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
            {contentData.portfolio.items.map((item: any, index: number) => (
              <div key={index} style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <strong>项目 #{index + 1}</strong>
                  <button
                    onClick={() => removePortfolioItem(index)}
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
                    value={item.name.zh}
                    onChange={(e) => updatePortfolioItem(index, "zh", "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="项目名称（英文）"
                    value={item.name.en}
                    onChange={(e) => updatePortfolioItem(index, "en", "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="项目链接（选填）"
                    value={item.link || ""}
                    onChange={(e) => updatePortfolioItem(index, "", "link", e.target.value)}
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
        )}

        {/* ===== 项目 ===== */}
        {activeTab === "projects" && (
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
        )}

        {/* ===== 研究与活动 ===== */}
        {activeTab === "research" && (
          <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>研究与活动</h2>
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
            {contentData.research.list.map((item: any, index: number) => (
              <div key={index} style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <strong>项目 #{index + 1}</strong>
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
                <div style={{ display: "grid", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="名称（中文）"
                    value={item.name.zh}
                    onChange={(e) => updateResearch(index, "zh", "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="名称（英文）"
                    value={item.name.en}
                    onChange={(e) => updateResearch(index, "en", "name", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                  <textarea
                    placeholder="描述（中文）"
                    value={item.desc.zh}
                    onChange={(e) => updateResearch(index, "zh", "desc", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minHeight: "60px"
                    }}
                  />
                  <textarea
                    placeholder="描述（英文）"
                    value={item.desc.en}
                    onChange={(e) => updateResearch(index, "en", "desc", e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      minHeight: "60px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="链接（选填）"
                    value={item.link || ""}
                    onChange={(e) => updateResearch(index, "", "link", e.target.value)}
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
        )}
      </div>
    </div>
  )
}
