import { NextResponse } from 'next/server'

export async function GET() {
  const data = {
    organization: {
      name: "锦秋基金",
      name_en: "Jinqiu Capital",
      type: "AI-Native 双币早期投资机构",
      fund_period: "12年期基金",
      portfolio_count: "70+",
      email: "ai@jinqiucapital.com",
      website: "https://jinqiucapital.com"
    },
    focus_areas: [
      "AI 应用",
      "具身智能",
      "算力基础与模型基础"
    ],
    sections: [
      {
        id: "about",
        title: "关于锦秋",
        url: "https://jinqiucapital.com/#about"
      },
      {
        id: "team",
        title: "团队",
        url: "https://jinqiucapital.com/#team"
      },
      {
        id: "portfolio",
        title: "投资组合",
        url: "https://jinqiucapital.com/#portfolio"
      },
      {
        id: "projects",
        title: "项目矩阵",
        url: "https://jinqiucapital.com/#projects"
      },
      {
        id: "library",
        title: "研究库",
        url: "https://jinqiucapital.com/#library"
      }
    ],
    projects: [
      {
        name: "Soli 种子计划",
        description: "面向 AI 创业者的早期支持计划",
        url: "https://soli.jinqiucapital.com"
      }
    ],
    library: [
      {
        name: "Jinqiu Spotlight",
        slug: "jinqiu-spotlight",
        description: "追踪锦秋基金与被投企业的动态"
      },
      {
        name: "Jinqiu Select",
        slug: "jinqiu-select",
        description: "AI报告解读、行业研究分析"
      },
      {
        name: "锦秋AI实验室",
        slug: "jinqiu-lab",
        description: "AI产品测评与效率场景探索"
      },
      {
        name: "锦秋小饭桌",
        slug: "jinqiu-roundtable",
        description: "为创业者打造的常态化闭门社交活动"
      },
      {
        name: "锦秋会",
        slug: "jinqiu-summit",
        description: "一年一度的锦秋CEO大会"
      }
    ],
    meta: {
      version: "1.0",
      last_updated: "2025-01-01",
      description: "为 AI Agent 发现而构建"
    }
  }

  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}

