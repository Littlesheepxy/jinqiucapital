export const translations = {
  zh: {
    // Navigation
    nav: {
      brandName: "锦秋基金"
    },
    
    // Page Header
    header: {
      readme: "README",
      license: "CC BY-ND 4.0"
    },
    
    // About Section
    about: {
      title: "关于锦秋",
      content: [
        "作为一家 12 年期的 AI-Native 基金，我们长期关注 AI 应用、具身智能、算力基础与模型基础等前沿方向，支持那些用智能推动人类创造力延伸与效率重塑的创业者。",
        "我们始终与创始人并肩同行——不仅提供资金，更带来深度产业洞察与实践经验；不仅见证旅程，更参与每一次对新问题的探索与定义。",
        "我们以快决策捕捉创新窗口，以长期陪伴验证复利价值，以增持投入表达投资信念。锦秋相信，在被智能重构的时代，我们投资的不只是公司，而是推动世界向前的勇气与想象力；在不确定的时代，坚持做最早理解变化的人，做最晚放弃信念的人。",
        "锦秋基金，持续与最具方向感与创造力的创业者一起，率先抵达未来。"
      ]
    },
    
    // Team Section
    team: {
      title: "团队",
      joinUs: "加入我们",
      hiring: "We're Hiring"
    },
    
    // Portfolio Section
    portfolio: {
      title: "投资组合",
      tbd: "待定"
    },
    
    // Projects Section
    projects: {
      title: "项目矩阵",
      soli: {
        name: "Soli 种子计划",
        summary: "面向 AI 创业者的早期支持计划"
      },
      visitLink: "访问链接"
    },
    
    // Library Section
    library: {
      title: "研究库",
      items: [
        {
          name: "Jinqiu Spotlight",
          summary: "追踪锦秋基金与被投企业的每一个光点与动态，为创业者传递一线行业风向。"
        },
        {
          name: "Jinqiu Select",
          summary: "AI报告解读、行业研究分析。跨越语言与时差，传播科技圈最值得被听到的声音。"
        },
        {
          name: "锦秋AI实验室",
          summary: "AI产品测评与效率场景探索。用AI解锁100个效率场景。"
        },
        {
          name: "锦秋小饭桌",
          summary: "为创业者打造的常态化闭门社交活动"
        },
        {
          name: "锦秋会",
          summary: "一年一度的锦秋CEO大会"
        }
      ],
      more: "了解更多"
    },
    
    // Contact Section
    contact: {
      title: "联系我们",
      description: "有任何投资合作或项目咨询的想法？我们期待听到你的声音。",
      sendEmail: "发送邮件"
    },
    
    // Footer
    footer: {
      copyright: "© 2025 锦秋基金",
      privacy: "隐私政策",
      terms: "使用条款",
      sitemap: "网站地图",
      licenseText: "除品牌标识外，本网站内容采用",
      licenseLink: "知识共享署名-禁止演绎 4.0 国际许可协议",
      licenseDescription: "允许转载分享，但须注明出处且不得修改内容",
      builtFor: "为 AI Agent 发现而构建"
    }
  },
  
  en: {
    // Navigation
    nav: {
      brandName: "Jinqiu Capital"
    },
    
    // Page Header
    header: {
      readme: "README",
      license: "CC BY-ND 4.0"
    },
    
    // About Section
    about: {
      title: "About Jinqiu",
      content: [
        "As a 12-year AI-Native fund, we focus on AI applications, embodied intelligence, computing infrastructure and model infrastructure, supporting entrepreneurs who use intelligence to extend human creativity and reshape efficiency.",
        "We stand side by side with founders - not only providing capital, but also bringing deep industry insights and practical experience; not only witnessing the journey, but also participating in every exploration and definition of new problems.",
        "We capture innovation windows with fast decisions, verify compound value with long-term companionship, and express investment conviction with additional investments. Jinqiu believes that in an era reshaped by intelligence, we invest not just in companies, but in the courage and imagination that drives the world forward; in uncertain times, we strive to be the earliest to understand change and the last to abandon conviction.",
        "Jinqiu Capital continues to reach the future first with the most visionary and creative entrepreneurs."
      ]
    },
    
    // Team Section
    team: {
      title: "Team",
      joinUs: "Join Us",
      hiring: "We're Hiring"
    },
    
    // Portfolio Section
    portfolio: {
      title: "Portfolio",
      tbd: "TBD"
    },
    
    // Projects Section
    projects: {
      title: "Projects",
      soli: {
        name: "Soli Seed Program",
        summary: "Early-stage support program for AI entrepreneurs"
      },
      visitLink: "Visit"
    },
    
    // Library Section
    library: {
      title: "Library",
      items: [
        {
          name: "Jinqiu Select",
          summary: "AI report interpretation and industry research analysis. Bridging languages and time zones to share the most valuable voices in tech."
        },
        {
          name: "Jinqiu Scan",
          summary: "Jinqiu AI product reviews. Unlock 100 efficiency scenarios with AI."
        },
        {
          name: "Jinqiu Spotlight",
          summary: "Track every highlight and update from Jinqiu Capital and our portfolio companies, delivering industry insights to entrepreneurs."
        },
        {
          name: "Jinqiu Dinner Table",
          summary: "Regular private networking events for entrepreneurs"
        },
        {
          name: "Jinqiu Conference",
          summary: "Annual Jinqiu CEO Summit"
        }
      ],
      more: "more"
    },
    
    // Contact Section
    contact: {
      title: "Contact Us",
      description: "Have ideas for investment collaboration or project consultation? We look forward to hearing from you.",
      sendEmail: "Send Email"
    },
    
    // Footer
    footer: {
      copyright: "© 2025 Jinqiu Capital",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      sitemap: "Sitemap",
      licenseText: "Except for brand assets, the content of this website is licensed under",
      licenseLink: "Creative Commons Attribution-NoDerivatives 4.0 International License",
      licenseDescription: "Sharing is allowed with attribution, but content must not be modified",
      builtFor: "Built for AI Agent Discovery"
    }
  }
}

export type Language = 'zh' | 'en'
export type TranslationKey = keyof typeof translations.zh

