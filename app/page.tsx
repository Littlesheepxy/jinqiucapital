"use client"

import { useState, useEffect } from "react"
import { SimpleMarkdown } from "@/components/simple-markdown"

export default function Page() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [contentData, setContentData] = useState<any>(null)
  const [teamData, setTeamData] = useState<any[]>([])
  const [showAllPortfolio, setShowAllPortfolio] = useState(false)

  useEffect(() => {
    // Detect browser language
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.includes("en")) {
      setLanguage("en")
    }

    // Load content and team data from API (reads from Edge Config in production)
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContentData(data.content)
        setTeamData(data.team)
      })
      .catch((err) => console.error("Failed to load data:", err))
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  if (!contentData) {
    return <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
  }

  const lang = language
  const brandName = contentData.settings.brandName[lang]

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      lineHeight: "1.6",
      color: "#000"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px" }}>
        <img 
          src="/jinqiu-logo.png" 
          alt={brandName}
          style={{ height: "40px" }}
        />
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, flex: 1 }}>
          {brandName}
        </h1>
        <button 
          onClick={toggleLanguage}
          style={{
            background: "none",
            border: "1px solid #ccc",
            padding: "4px 12px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          {lang === "zh" ? "EN" : "中"}
        </button>
      </div>

      {/* Intro */}
      <div style={{ marginBottom: "50px" }}>
        <SimpleMarkdown text={contentData.about.intro[lang]} />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Team */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Team
      </h2>
      <ul style={{ listStyle: "disc", paddingLeft: "20px", marginBottom: "40px" }}>
        {teamData.map((member, i) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            {member.link ? (
              <a
                href={member.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
              >
                {member.name}
              </a>
            ) : (
              <strong>{member.name}</strong>
            )}
            {member.title && ` | ${member.title}`}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: "16px" }}>
        <a 
          href="https://app.mokahr.com/social-recruitment/jinqiucapital/84697"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
        >
          {lang === "zh" ? "加入我们" : "Join Us"}
        </a>
      </p>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Portfolio */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Portfolio
      </h2>
      <p style={{ marginBottom: "16px" }}>{contentData.portfolio.desc[lang]}</p>
      {contentData.portfolio.items && contentData.portfolio.items.length > 0 && (
        <>
          <ul style={{ listStyle: "disc", paddingLeft: "20px", marginBottom: "16px" }}>
            {contentData.portfolio.items
              .slice(0, showAllPortfolio ? contentData.portfolio.items.length : 10)
              .map((item: any, i: number) => {
                // 格式化创始人列表
                const formatFounders = (founders: any[]) => {
                  if (!founders || founders.length === 0) return ""
                  
                  const founderElements = founders.map((founder: any, fIndex: number) => {
                    const name = founder.link ? (
                      <a
                        href={founder.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#225BBA", textDecoration: "none" }}
                      >
                        {founder.name[lang]}
                      </a>
                    ) : (
                      founder.name[lang]
                    )
                    
                    // 中文: 使用顿号和"和"
                    if (lang === "zh") {
                      if (fIndex === founders.length - 1 && founders.length > 1) {
                        return <span key={fIndex}>和{name}</span>
                      } else if (fIndex > 0) {
                        return <span key={fIndex}>、{name}</span>
                      }
                      return <span key={fIndex}>{name}</span>
                    }
                    
                    // 英文: 使用逗号和"and"
                    if (fIndex === founders.length - 1 && founders.length > 1) {
                      return <span key={fIndex}>, and {name}</span>
                    } else if (fIndex > 0) {
                      return <span key={fIndex}>, {name}</span>
                    }
                    return <span key={fIndex}>{name}</span>
                  })
                  
                  return founderElements
                }

                return (
                  <li key={i} style={{ marginBottom: "12px" }}>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
                      >
                        {item.name[lang]}
                      </a>
                    ) : (
                      <strong>{item.name[lang]}</strong>
                    )}
                    {item.founders && item.founders.length > 0 && (
                      <span style={{ color: "#666" }}>
                        {lang === "zh" ? ", 由" : ", founded by "}
                        {formatFounders(item.founders)}
                        {lang === "zh" ? "创立" : ""}
                      </span>
                    )}
                  </li>
                )
              })}
          </ul>
          
          {/* 显示更多/收起文本链接 */}
          {contentData.portfolio.items.length > 10 && (
            <p style={{ marginBottom: "40px" }}>
              <span
                onClick={() => setShowAllPortfolio(!showAllPortfolio)}
                style={{
                  color: "#225BBA",
                  cursor: "pointer",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = "underline"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = "none"
                }}
              >
                {showAllPortfolio 
                  ? (lang === "zh" ? `收起 ▲` : `Show Less ▲`)
                  : (lang === "zh" 
                      ? `显示更多 (${contentData.portfolio.items.length - 10}) ▼` 
                      : `Show More (${contentData.portfolio.items.length - 10}) ▼`)
                }
              </span>
            </p>
          )}
        </>
      )}

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Projects */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Projects
      </h2>
      <ul style={{ listStyle: "disc", paddingLeft: "20px", marginBottom: "40px" }}>
        {contentData.projects.list.map((project: any, i: number) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            <a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
            >
              {project.name[lang]}
            </a>
            {": " + project.desc[lang]}
          </li>
        ))}
      </ul>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Library */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Library
      </h2>
      <ul style={{ listStyle: "disc", paddingLeft: "20px", marginBottom: "40px" }}>
        {contentData.research.list.map((item: any, i: number) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            {item.slug ? (
              <a
                href={`/library/${item.slug}`}
                style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
              >
                {item.name[lang]}
              </a>
            ) : item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
              >
                {item.name[lang]}
              </a>
            ) : (
              <strong>{item.name[lang]}</strong>
            )}
            : {item.desc[lang]}
          </li>
        ))}
      </ul>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Contact */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Contact
      </h2>
      <p style={{ marginBottom: "40px" }}>
        <a 
          href="mailto:contact@jinqiucapital.com"
          style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
        >
          contact@jinqiucapital.com
        </a>
      </p>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Footer */}
      <div style={{ fontSize: "14px", color: "#666", marginTop: "60px" }}>
        <p>{lang === "zh" ? "© 2025 锦秋基金" : "© 2025 Jinqiu Capital"}</p>
      </div>
    </div>
  )
}
