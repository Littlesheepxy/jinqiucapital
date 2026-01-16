"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SimpleMarkdown } from "@/components/simple-markdown"

export default function SoilPage() {
  const [language, setLanguage] = useState<"zh" | "en">("zh")
  const [contentData, setContentData] = useState<any>(null)
  const [pageContent, setPageContent] = useState<string>("")
  const [projectInfo, setProjectInfo] = useState<any>(null)

  useEffect(() => {
    // Detect browser language
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.includes("en")) {
      setLanguage("en")
    }

    // Load content data
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContentData(data.content)
        // 查找 slug 为 soil 的项目
        const soilProject = data.content?.projects?.list?.find(
          (p: any) => p.slug === "soil"
        )
        if (soilProject) {
          setProjectInfo(soilProject)
          // 根据语言设置内容
          const lang = browserLanguage.includes("en") ? "en" : "zh"
          setPageContent(soilProject.pageContent?.[lang] || "")
        }
      })
      .catch((err) => console.error("Failed to load data:", err))
  }, [])

  // 语言切换时更新内容
  useEffect(() => {
    if (projectInfo?.pageContent) {
      setPageContent(projectInfo.pageContent[language] || "")
    }
  }, [language, projectInfo])

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  const lang = language
  const brandName = contentData?.settings?.brandName?.[lang] || (lang === "zh" ? "锦秋基金" : "Jinqiu Capital")
  const projectName = projectInfo?.name?.[lang] || (lang === "zh" ? "Soil 种子专项计划" : "Soil Seed Program")
  const projectDesc = projectInfo?.desc?.[lang] || ""

  // 如果没有配置 pageContent，显示默认内容
  const defaultContent = lang === "zh" ? `
<h2>Soil 种子专项计划</h2>
<p style="font-style: italic; color: #666;">Where AI ideas take root.</p>

<p>Soil 是锦秋基金面向早期 AI 创业者设立的种子投资项目。</p>
<p>我们关注 AI 技术变革带来的新应用机会，从产品 idea 阶段开始，支持真正想把 AI 带入现实世界的创始团队。</p>

<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #225BBA; margin: 24px 0;">
<p><strong>Soil 的原则很简单：帮忙，不添乱。</strong></p>
<p>以最简洁的路径、最快的行动，坚定站在创业者身后，陪他们共同应对 AI 早期阶段的不确定性。</p>
</div>

<p>"Soil" 意味着滋养生长的沃土。</p>
<p>对锦秋而言，秋天代表收获，但我们却更希望把目光投向那一片即将燎原的"生命力"——新领域正在破土，种子刚刚发芽。</p>
<p>我们不只想成为收获者，而是成为滋养种子的那片土壤，陪伴创业者走过春夏，直到想法生根、产品成形、价值显现。</p>

<div style="background: #fff8e6; padding: 20px; border-radius: 8px; margin: 24px 0;">
<p>如果你相信 AI 正在改变世界，并愿意投身其中——</p>
<p>无论你是否有创业经验，身处国内还是海外，工作还是在读，Soil 都愿意成为你最早的同行者。</p>
</div>

<h3 style="color: #225BBA;">我们提供：灵活而坚定的第一笔支持</h3>
<ul>
<li>为验证产品想法提供启动资金，帮助你尽快走到真实场景。</li>
<li>快速决策、简洁流程，部分项目曾在当天完成投资决策。</li>
<li>灵活的投资方案与可持续的后续支持，从种子到成长阶段一路陪伴。</li>
<li>创业者友好的投资条款，超过 12 年的投资周期，让你专注于产品与技术本身。</li>
</ul>

<h3 style="color: #225BBA;">在关键节点，给到刚刚好的帮助</h3>
<p>如你所需，我们会在关键时刻提供精准、实用、不打扰的支持，而非模板化建议：</p>
<ul>
<li><strong>判断与交流</strong>：与一线投资人、AI 从业者深入讨论产品与技术方向</li>
<li><strong>资源连接</strong>：对接优秀的产品、技术与创业者网络；加入由 AI 创业者组成的紧密社群，共同进化、破土生长</li>
<li><strong>长期陪伴</strong>：在不确定性中，始终有人与你站在同一侧</li>
</ul>

<h3 style="color: #225BBA;">如何申请 Soil 计划</h3>
<p>你可以发送团队和项目介绍到以下邮箱：</p>
<p><a href="mailto:soil@jinqiucapital.com" style="font-size: 18px; font-weight: bold;">soil@jinqiucapital.com</a></p>

<div style="background: #e8f4e8; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
<p>我们将会尽快与你联系。</p>
<p><strong>期待看到你和团队的破土生长！</strong></p>
</div>
  ` : `
<h2>Soil Seed Program</h2>
<p style="font-style: italic; color: #666;">Where AI ideas take root.</p>

<p>Soil is a seed investment program established by Jinqiu Capital for early-stage AI entrepreneurs.</p>
<p>We focus on new application opportunities brought by AI technology transformation, supporting founding teams who truly want to bring AI into the real world from the product idea stage.</p>

<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #225BBA; margin: 24px 0;">
<p><strong>Soil's principle is simple: Help, don't hinder.</strong></p>
<p>With the simplest path and fastest action, we firmly stand behind entrepreneurs, accompanying them through the uncertainties of the early AI stage.</p>
</div>

<p>"Soil" represents the fertile ground that nurtures growth.</p>
<p>For Jinqiu, autumn represents harvest, but we prefer to focus on the "vitality" that is about to spread like wildfire—new fields are breaking ground, seeds are just sprouting.</p>
<p>We don't just want to be harvesters, but to be the soil that nourishes seeds, accompanying entrepreneurs through spring and summer until ideas take root, products take shape, and value emerges.</p>

<div style="background: #fff8e6; padding: 20px; border-radius: 8px; margin: 24px 0;">
<p>If you believe AI is changing the world and are willing to dive in—</p>
<p>Whether you have entrepreneurial experience or not, whether you're domestic or overseas, working or studying, Soil is willing to be your earliest companion.</p>
</div>

<h3 style="color: #225BBA;">We Offer: Flexible and Firm First Support</h3>
<ul>
<li>Startup funding to validate product ideas, helping you reach real scenarios as quickly as possible.</li>
<li>Fast decisions, simple processes—some projects have completed investment decisions on the same day.</li>
<li>Flexible investment plans and sustainable follow-up support, accompanying you from seed to growth stage.</li>
<li>Entrepreneur-friendly investment terms, with an investment cycle of over 12 years, allowing you to focus on the product and technology itself.</li>
</ul>

<h3 style="color: #225BBA;">Just-Right Help at Critical Points</h3>
<p>As needed, we provide precise, practical, non-intrusive support at critical moments, rather than templated advice:</p>
<ul>
<li><strong>Judgment & Exchange</strong>: In-depth discussions with frontline investors and AI practitioners on product and technology direction</li>
<li><strong>Resource Connection</strong>: Connect with excellent product, technology, and entrepreneur networks; join a tight-knit community of AI entrepreneurs to evolve and grow together</li>
<li><strong>Long-term Companionship</strong>: In uncertainty, someone is always on your side</li>
</ul>

<h3 style="color: #225BBA;">How to Apply for Soil Program</h3>
<p>You can send your team and project introduction to:</p>
<p><a href="mailto:soil@jinqiucapital.com" style="font-size: 18px; font-weight: bold;">soil@jinqiucapital.com</a></p>

<div style="background: #e8f4e8; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
<p>We will contact you as soon as possible.</p>
<p><strong>Looking forward to seeing you and your team break ground and grow!</strong></p>
</div>
  `

  const displayContent = pageContent || defaultContent

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      lineHeight: "1.8",
      color: "#000"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/">
          <img 
            src="/jinqiu-logo.png" 
            alt={brandName}
            style={{ height: "40px", cursor: "pointer" }}
          />
        </Link>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, flex: 1 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            {brandName}
          </Link>
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

      {/* Content */}
      <div 
        className="soil-content"
        dangerouslySetInnerHTML={{ __html: displayContent }}
        style={{ 
          lineHeight: "1.8",
          fontSize: "16px"
        }}
      />

      <style jsx global>{`
        .soil-content h2 {
          font-size: 28px;
          font-weight: bold;
          color: #225BBA;
          margin-bottom: 8px;
        }
        .soil-content h3 {
          font-size: 20px;
          font-weight: bold;
          margin-top: 32px;
          margin-bottom: 16px;
        }
        .soil-content p {
          margin-bottom: 16px;
        }
        .soil-content ul {
          padding-left: 24px;
          margin-bottom: 24px;
        }
        .soil-content li {
          margin-bottom: 12px;
        }
        .soil-content a {
          color: #225BBA;
          text-decoration: none;
        }
        .soil-content a:hover {
          text-decoration: underline;
        }
        .soil-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
      `}</style>

      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "40px 0" }} />

      {/* Back Link */}
      <div style={{ marginBottom: "40px" }}>
        <Link 
          href="/"
          style={{ color: "#225BBA", textDecoration: "none" }}
        >
          ← {lang === "zh" ? "返回首页" : "Back to Home"}
        </Link>
      </div>

      {/* Footer */}
      <div style={{ fontSize: "14px", color: "#666", marginTop: "60px" }}>
        <p>{lang === "zh" ? "© 2025 锦秋基金" : "© 2025 Jinqiu Capital"}</p>
      </div>
    </div>
  )
}
