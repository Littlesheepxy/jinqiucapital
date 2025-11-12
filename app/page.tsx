"use client"

import { useState, useEffect } from "react"

export default function Page() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [contentData, setContentData] = useState<any>(null)
  const [teamData, setTeamData] = useState<any[]>([])

  useEffect(() => {
    // Detect browser language
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.includes("en")) {
      setLanguage("en")
    }

    // Load content data
    fetch("/data/content.json")
      .then((res) => res.json())
      .then((data) => setContentData(data))
      .catch((err) => console.error("Failed to load content:", err))

    // Load team data
    fetch("/data/team.json")
      .then((res) => res.json())
      .then((data) => setTeamData(data))
      .catch((err) => console.error("Failed to load team data:", err))
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
        {contentData.about.paragraphs.map((para: any, i: number) => (
          <p key={i} style={{ marginBottom: "16px" }}>{para[lang]}</p>
        ))}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Team */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        {lang === "zh" ? "团队" : "People"}
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
            {lang === "zh" && member.title_zh && ` (${member.title_zh})`}
            {lang === "en" && member.title && ` (${member.title})`}
          </li>
        ))}
        <li style={{ marginTop: "16px" }}>
          <a 
            href="https://app.mokahr.com/social-recruitment/jinqiucapital/84697"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
          >
            {lang === "zh" ? "加入我们" : "Join Us"}
          </a>
        </li>
      </ul>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Portfolio */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        {contentData.portfolio.title[lang]}
      </h2>
      <p style={{ marginBottom: "40px" }}>{contentData.portfolio.description[lang]}</p>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Projects */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        {lang === "zh" ? "项目矩阵" : "Projects"}
      </h2>
      <ul style={{ listStyle: "disc", paddingLeft: "20px", marginBottom: "40px" }}>
        {contentData.projects.map((project: any, i: number) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            <a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
            >
              {project.name[lang]}
            </a>
            {": " + project.description[lang]}
          </li>
        ))}
      </ul>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Research & Events */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        {lang === "zh" ? "研究与活动" : "Research & Events"}
      </h2>
      <ul style={{ listStyle: "disc", paddingLeft: "20px", marginBottom: "40px" }}>
        {contentData.research.map((item: any, i: number) => (
          <li key={i} style={{ marginBottom: "8px" }}>
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#225BBA", textDecoration: "none", fontWeight: "bold" }}
              >
                {typeof item.name === "string" ? item.name : item.name[lang]}
              </a>
            ) : (
              <strong>{typeof item.name === "string" ? item.name : item.name[lang]}</strong>
            )}
            : {item.description[lang]}
          </li>
        ))}
      </ul>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Contact */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        {lang === "zh" ? "联系方式" : "Contact"}
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
