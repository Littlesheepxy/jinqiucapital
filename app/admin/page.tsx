"use client"

import { useState, useEffect } from "react"
import { RichTextEditor } from "@/components/rich-text-editor"
import Confetti from "react-confetti"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [contentData, setContentData] = useState<any>(null)
  const [teamData, setTeamData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"intro" | "team" | "portfolio" | "projects" | "research">("intro")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [activeResearchIndex, setActiveResearchIndex] = useState(0)
  const [expandedArticles, setExpandedArticles] = useState<{[key: string]: boolean}>({})
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewLanguage, setPreviewLanguage] = useState<"zh" | "en">("zh")
  const [previewType, setPreviewType] = useState<"intro" | "research-intro" | "research-article">("intro")
  const [previewResearchIndex, setPreviewResearchIndex] = useState(0)
  const [previewArticleIndex, setPreviewArticleIndex] = useState(0)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

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
        // 显示欢迎弹窗和撒花效果
        setShowWelcomeModal(true)
        setShowConfetti(true)
        // 3秒后停止撒花
        setTimeout(() => setShowConfetti(false), 3000)
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
    updated.portfolio.items.push({ 
      name: { zh: "", en: "" }, 
      link: "",
      founders: []
    })
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

  const addPortfolioFounder = (itemIndex: number) => {
    const updated = { ...contentData }
    if (!updated.portfolio.items[itemIndex].founders) {
      updated.portfolio.items[itemIndex].founders = []
    }
    updated.portfolio.items[itemIndex].founders.push({ name: { zh: "", en: "" }, link: "" })
    setContentData(updated)
  }

  const removePortfolioFounder = (itemIndex: number, founderIndex: number) => {
    const updated = { ...contentData }
    updated.portfolio.items[itemIndex].founders = updated.portfolio.items[itemIndex].founders.filter((_: any, i: number) => i !== founderIndex)
    setContentData(updated)
  }

  const updatePortfolioFounder = (itemIndex: number, founderIndex: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "link") {
      updated.portfolio.items[itemIndex].founders[founderIndex].link = value
    } else {
      updated.portfolio.items[itemIndex].founders[founderIndex].name[lang] = value
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
      slug: "",
      intro: { zh: "", en: "" },
      articles: []
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
    if (field === "slug") {
      updated.research.list[index].slug = value
    } else if (field === "intro") {
      updated.research.list[index].intro[lang] = value
    } else {
      updated.research.list[index][field][lang] = value
    }
    setContentData(updated)
  }

  const addArticle = (researchIndex: number) => {
    const updated = { ...contentData }
    if (!updated.research.list[researchIndex].articles) {
      updated.research.list[researchIndex].articles = []
    }
    updated.research.list[researchIndex].articles.push({
      title: { zh: "", en: "" },
      slug: "",
      content: { zh: "", en: "" }
    })
    setContentData(updated)
  }

  const removeArticle = (researchIndex: number, articleIndex: number) => {
    const updated = { ...contentData }
    updated.research.list[researchIndex].articles = updated.research.list[researchIndex].articles.filter((_: any, i: number) => i !== articleIndex)
    setContentData(updated)
  }

  const updateArticle = (researchIndex: number, articleIndex: number, lang: string, field: string, value: string) => {
    const updated = { ...contentData }
    if (field === "slug") {
      updated.research.list[researchIndex].articles[articleIndex].slug = value
    } else if (field === "content") {
      updated.research.list[researchIndex].articles[articleIndex].content[lang] = value
    } else {
      updated.research.list[researchIndex].articles[articleIndex][field][lang] = value
    }
    setContentData(updated)
  }

  // 切换文章展开/折叠状态
  const toggleArticleExpand = (researchIndex: number, articleIndex: number) => {
    const key = `${researchIndex}-${articleIndex}`
    setExpandedArticles(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 检查文章是否展开
  const isArticleExpanded = (researchIndex: number, articleIndex: number) => {
    const key = `${researchIndex}-${articleIndex}`
    return expandedArticles[key] || false
  }

  // 更新预览内容
  const updatePreview = (content: string, type: "intro" | "research-intro" | "research-article", researchIdx?: number, articleIdx?: number) => {
    setPreviewContent(content)
    setPreviewType(type)
    if (researchIdx !== undefined) setPreviewResearchIndex(researchIdx)
    if (articleIdx !== undefined) setPreviewArticleIndex(articleIdx)
    if (!showPreview) {
      setShowPreview(true)
    }
  }

  // 在新标签页打开预览
  const openPreviewInNewTab = () => {
    let url = ""
    if (previewType === "intro") {
      url = "/"
    } else if (previewType === "research-intro" && contentData.research.list[previewResearchIndex]) {
      const slug = contentData.research.list[previewResearchIndex].slug
      url = `/library/${slug}`
    } else if (previewType === "research-article" && contentData.research.list[previewResearchIndex]) {
      const researchSlug = contentData.research.list[previewResearchIndex].slug
      const article = contentData.research.list[previewResearchIndex].articles?.[previewArticleIndex]
      if (article?.slug) {
        url = `/library/${researchSlug}/${article.slug}`
      }
    }
    if (url) {
      window.open(url, '_blank')
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
      <div style={{ 
        display: "flex", 
        gap: showPreview ? "20px" : "0",
        padding: "24px",
        maxWidth: showPreview ? "100%" : "1200px",
        margin: "0 auto",
        transition: "all 0.3s"
      }}>
        {/* 左侧编辑区 */}
        <div style={{ 
          flex: showPreview ? "1" : "auto",
          width: showPreview ? "auto" : "100%",
          transition: "all 0.3s"
        }}>
        
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
                  if (previewLanguage === "zh") updatePreview(value, "intro")
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
                  if (previewLanguage === "en") updatePreview(value, "intro")
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
                border: "2px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
                backgroundColor: "#fafafa"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <strong style={{ fontSize: "16px" }}>项目 #{index + 1}</strong>
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
                    删除项目
                  </button>
                </div>
                
                {/* 项目基本信息 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px", 
                  marginBottom: "16px",
                  border: "1px solid #e0e0e0"
                }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#225BBA" }}>
                    📌 项目信息
                  </h4>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <input
                      type="text"
                      placeholder="项目名称（中文）"
                      value={item.name.zh}
                      onChange={(e) => updatePortfolioItem(index, "zh", "name", e.target.value)}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="项目名称（英文）"
                      value={item.name.en}
                      onChange={(e) => updatePortfolioItem(index, "en", "name", e.target.value)}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="项目官网链接（选填）"
                      value={item.link || ""}
                      onChange={(e) => updatePortfolioItem(index, "", "link", e.target.value)}
                      style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                {/* 创始人列表 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#225BBA" }}>
                      👤 创始人信息
                    </h4>
                    <button
                      onClick={() => addPortfolioFounder(index)}
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
                      + 添加创始人
                    </button>
                  </div>
                  
                  {item.founders && item.founders.length > 0 ? (
                    item.founders.map((founder: any, founderIndex: number) => (
                      <div key={founderIndex} style={{
                        backgroundColor: "#f9f9f9",
                        padding: "12px",
                        borderRadius: "4px",
                        marginBottom: "10px",
                        border: "1px solid #e8e8e8"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", color: "#666" }}>创始人 #{founderIndex + 1}</span>
                          <button
                            onClick={() => removePortfolioFounder(index, founderIndex)}
                            style={{
                              padding: "2px 8px",
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
                        <div style={{ display: "grid", gap: "8px" }}>
                          <input
                            type="text"
                            placeholder="创始人姓名（中文）"
                            value={founder.name.zh}
                            onChange={(e) => updatePortfolioFounder(index, founderIndex, "zh", "name", e.target.value)}
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}
                          />
                          <input
                            type="text"
                            placeholder="创始人姓名（英文）"
                            value={founder.name.en}
                            onChange={(e) => updatePortfolioFounder(index, founderIndex, "en", "name", e.target.value)}
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}
                          />
                          <input
                            type="text"
                            placeholder="创始人个人链接（选填，如LinkedIn、Twitter等）"
                            value={founder.link || ""}
                            onChange={(e) => updatePortfolioFounder(index, founderIndex, "", "link", e.target.value)}
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              fontSize: "13px"
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#999", fontSize: "13px", fontStyle: "italic" }}>
                      暂无创始人信息，点击上方按钮添加
                    </p>
                  )}
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

            {/* 项目切换标签 */}
            {contentData.research.list.length > 0 && (
              <div style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                borderBottom: "2px solid #e0e0e0",
                flexWrap: "wrap"
              }}>
                {contentData.research.list.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveResearchIndex(index)}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: activeResearchIndex === index ? "#225BBA" : "transparent",
                      color: activeResearchIndex === index ? "white" : "#666",
                      border: "none",
                      borderBottom: activeResearchIndex === index ? "none" : "2px solid transparent",
                      cursor: "pointer",
                      fontWeight: activeResearchIndex === index ? "bold" : "normal",
                      fontSize: "14px",
                      borderRadius: "4px 4px 0 0",
                      transition: "all 0.2s"
                    }}
                  >
                    {item.name.zh || `项目 ${index + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* 当前选中的项目 */}
            {contentData.research.list.length > 0 && contentData.research.list[activeResearchIndex] && (() => {
              const item = contentData.research.list[activeResearchIndex]
              const index = activeResearchIndex
              return (
              <div key={index} style={{
                border: "2px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
                backgroundColor: "#fafafa"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <strong style={{ fontSize: "16px" }}>项目 #{index + 1}</strong>
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
                      placeholder="URL Slug（英文，如: jinqiu-select）"
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

                {/* 文章列表 */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#225BBA" }}>
                      📚 文章列表
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
                      暂无文章，点击上方按钮添加
                    </p>
                  )}
                </div>
              </div>
              )
            })()}
          </div>
        )}
        </div>

        {/* 右侧预览区 */}
        {showPreview && (
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
                      {contentData?.settings?.brandName?.[previewLanguage] || "锦秋基金"}
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
        )}
      </div>

      {/* 撒花效果 */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#225BBA', '#17a2b8', '#28a745', '#ffc107', '#dc3545', '#6f42c1']}
        />
      )}

      {/* 欢迎弹窗 */}
      {showWelcomeModal && (
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
      )}

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes modal-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modal-scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
