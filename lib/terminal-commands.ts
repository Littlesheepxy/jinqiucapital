// 终端命令数据库
interface TerminalCommandData {
  command: string
  output: string[]
  duration: number
}

interface CommandsDB {
  [module: string]: {
    [keyword: string]: TerminalCommandData
  }
}

export const terminalCommands: CommandsDB = {
  hero: {
    "AI-Native": {
      command: 'explain("AI-Native")',
      output: [
        "→ AI-Native 释义:",
        "  从成立第一天起，锦秋就将 AI 视为核心投资主题",
        "  不是跟随趋势，而是定义趋势",
        "",
        "→ 投资范围:",
        "  • AI 应用层 (应用智能重塑各行业)",
        "  • 具身智能 (机器人、自动驾驶)",
        "  • 算力基础 (芯片、云计算)",
        "  • 模型基础 (大模型、AI框架)",
      ],
      duration: 0.8,
    },
    "早期投资机构": {
      command: 'query("stage")',
      output: [
        "→ 投资阶段: Early-Stage (种子轮 - A轮)",
        "→ 投资理念: 捕捉创新窗口，陪伴长期成长",
        "→ 决策风格: 快速决策 + 深度陪伴",
        "",
        "我们相信，最大的价值在于:",
        "  成为创业者最早的同行者，而非最后的见证者",
      ],
      duration: 0.6,
    },
    "勇气与想象力": {
      command: 'philosophy("investment")',
      output: [
        "→ 投资哲学:",
        "",
        "  在不确定的时代,",
        "  我们投资的不只是公司，而是推动世界向前的",
        "  勇气与想象力",
        "",
        "→ 我们寻找:",
        "  • 敢于定义新问题的创业者",
        "  • 用技术重塑行业边界的团队",
        "  • 坚持长期主义的实践者",
      ],
      duration: 1.0,
    },
  },
  about: {
    "AI 应用": {
      command: 'focus("AI应用")',
      output: [
        "→ AI 应用层投资方向:",
        "",
        "  我们关注用 AI 重塑生产力与创造力的公司:",
        "  • 智能办公与协作",
        "  • AI 设计与内容生成",
        "  • 智能客服与营销",
        "  • 垂直行业 AI 解决方案",
      ],
      duration: 0.7,
    },
    "具身智能": {
      command: 'focus("具身智能")',
      output: [
        "→ 具身智能投资方向:",
        "",
        "  • 人形机器人 (通用智能载体)",
        "  • 工业机器人 (智能制造)",
        "  • 自动驾驶 (智能出行)",
        "  • 无人系统 (物流、配送、巡检)",
      ],
      duration: 0.7,
    },
    "算力基础与模型基础": {
      command: 'focus("基础设施")',
      output: [
        "→ 算力基础:",
        "  • AI 芯片 (GPU/NPU/ASIC)",
        "  • 云计算基础设施",
        "  • 边缘计算",
        "",
        "→ 模型基础:",
        "  • 大语言模型",
        "  • 多模态模型",
        "  • AI 开发框架与工具链",
      ],
      duration: 0.9,
    },
    "快决策": {
      command: 'style("decision")',
      output: [
        "→ 决策速度是我们的优势:",
        "",
        "  从初次接触到投资决策，平均 2-3 周",
        "  我们相信，创新窗口稍纵即逝",
        "  快速决策 = 对创业者的最大尊重",
      ],
      duration: 0.6,
    },
  },
  team: {},
  portfolio: {},
  projects: {},
  library: {},
}

// 动态生成 Team 命令
export function generateTeamCommand(name: string, position: string): TerminalCommandData {
  return {
    command: `profile("${name}")`,
    output: [
      `→ ${name}`,
      `  职位: ${position}`,
      "",
      "  详细信息请联系我们获取",
    ],
    duration: 0.5,
  }
}

// 动态生成 Portfolio 命令
export function generatePortfolioCommand(company: string): TerminalCommandData {
  return {
    command: `portfolio.query("${company}")`,
    output: [
      `→ 被投企业: ${company}`,
      "",
      "  详细投资信息请联系我们获取",
    ],
    duration: 0.5,
  }
}
