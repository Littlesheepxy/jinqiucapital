"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { FileText, Zap, Users, Briefcase, BookOpen, Mail } from "lucide-react"

export default function Page() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true)
    }
  }, [])

  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }, [isDark])

  return (
    <>
      <Navigation isDark={isDark} setIsDark={setIsDark} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="w-full py-8 md:py-12">
          <div className="border border-border rounded-lg bg-card p-8 md:p-10 lg:p-12 mx-4 lg:mx-8">
            {/* README Header Tab */}
            <div className="flex items-center gap-4 pb-4 mb-8 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText size={16} />
                <span>README</span>
              </div>
              <div className="text-xs text-muted-foreground">MIT 许可证</div>
            </div>

            {/* Hero / TL;DR */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-foreground">锦秋基金</h1>
              <p className="text-base leading-relaxed mb-6 text-foreground">
                锦秋基金是一家专注于人工智能领域的双币早期投资机构。
              </p>
              <a
                href="#contact"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                → 联系我们
              </a>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* About Jinqiu */}
            <section id="about" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground">关于锦秋</h2>
              <div className="space-y-6">
                {/* Institution Characteristics */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">机构属性</h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    作为一家 <strong>12 年期</strong>的 <strong>AI-Native 基金</strong>，我们长期关注 <strong>AI
                    应用</strong>、<strong>具身智能</strong>、<strong>算力基础与模型基础</strong>等前沿方向，支持那些用智能推动人类<strong>创造力延伸</strong>与<strong>效率重塑</strong>的创业者。
                  </p>
                </div>

                {/* Partnership Philosophy */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">与创始人同行</h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    我们始终与创始人<strong>并肩同行</strong>——不仅提供资金，更带来深度<strong>产业洞察</strong>与<strong>实践经验</strong>；不仅见证旅程，更参与每一次对新问题的<strong>探索与定义</strong>。
                  </p>
                </div>

                {/* Investment Philosophy */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                    投资理念与风格
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    我们以<strong>快决策</strong>捕捉创新窗口，以<strong>长期陪伴</strong>验证复利价值，以<strong>增持投入</strong>表达投资信念。锦秋相信，在被智能重构的时代，我们投资的不只是公司，而是推动世界向前的<strong>勇气与想象力</strong>。在不确定的时代，坚持做<strong>最早理解变化的人</strong>，做<strong>最晚放弃信念的人</strong>。
                  </p>
                </div>

                {/* Mission */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">使命</h3>
                  <p className="text-sm leading-relaxed text-foreground italic">
                    与最具<strong>方向感</strong>与<strong>创造力</strong>的创业者一起，<strong>率先抵达未来</strong>。
                  </p>
                </div>
              </div>

              {/* Key Stats */}
              <div className="bg-muted border border-border rounded p-4 mt-8">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-bold text-primary">12 年</span>
                    <span className="text-muted-foreground ml-2">早期投资经验</span>
                  </div>
                  <div>
                    <span className="font-bold text-primary">$1B+</span>
                    <span className="text-muted-foreground ml-2">组合规模（合并口径）</span>
                  </div>
                  <div>
                    <span className="font-bold text-primary">30+</span>
                    <span className="text-muted-foreground ml-2">家被投企业</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Key Facts */}
            <section id="facts" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground">关键信息</h2>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">身份定位</h3>
                <div className="flex flex-wrap gap-2">
                  {["AI-Native", "Early-Stage", "Dual-Currency"].map((tag) => (
                    <code
                      key={tag}
                      className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono rounded"
                    >
                      {tag}
                    </code>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">关注方向</h3>
                <p className="text-sm font-mono text-foreground bg-muted border border-border p-2 rounded">
                  AI 应用 | 具身智能 | 算力与模型基础
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  投资方法论
                </h3>
                <p className="text-sm font-mono text-foreground bg-muted border border-border p-2 rounded">
                  快决策 | 长期陪伴 | 增持投入
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">机构调性</h3>
                <p className="text-sm font-mono text-foreground bg-muted border border-border p-2 rounded">
                  敢 | 快 | 灵活 | 创新
                </p>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Team */}
            <section id="team" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Users size={24} />
                团队
              </h2>

              <div className="bg-muted border border-border rounded overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { name: "张三", title: "合伙人", focus: "具身智能" },
                      { name: "李四", title: "投资经理", focus: "应用与模型基础" },
                      { name: "王五", title: "投资经理", focus: "AI 应用" },
                      { name: "赵六", title: "分析师", focus: "产业研究" },
                    ].map((member, idx) => (
                      <tr key={member.name} className={idx > 0 ? "border-t border-border" : ""}>
                        <td className="px-4 py-3 font-medium">{member.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{member.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{member.focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground">16 人专业投资团队，覆盖 AI 应用、具身智能、芯片等方向。</p>
            </section>

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Portfolio */}
            <section id="portfolio" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Briefcase size={24} />
                投资组合
              </h2>

              <div className="mb-8">
                <h3 className="text-sm font-bold mb-3 text-foreground">具身智能</h3>
                <div className="bg-muted border border-border rounded p-4">
                  <div className="text-xs text-foreground space-y-1 font-mono">
                    {[
                      "宇树科技",
                      "星尘智能",
                      "地瓜机器人",
                      "乐享科技",
                      "流形空间",
                      "首形科技",
                      "World Engine",
                      "Dexmate",
                    ].map((company) => (
                      <div key={company}>• {company}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold mb-3 text-foreground">芯片</h3>
                <div className="bg-muted border border-border rounded p-4">
                  <div className="text-xs text-foreground space-y-1 font-mono">
                    {["东方算芯", "铭芯启睿", "微纳核芯", "澜昆微", "光本位"].map((company) => (
                      <div key={company}>• {company}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-3 text-foreground">应用</h3>
                <div className="bg-muted border border-border rounded p-4">
                  <p className="text-xs text-muted-foreground font-mono">更新中...</p>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Projects */}
            <section id="projects" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Zap size={24} />
                项目
              </h2>

              <div className="bg-muted border border-border rounded overflow-hidden">
                <div className="divide-y divide-border">
                  {[
                    {
                      name: "Soil 种子计划",
                      desc: "种子阶段 AI 应用专项投资",
                    },
                    {
                      name: "Talent-Q",
                      desc: "AI 驱动的智能招聘助手",
                    },
                    {
                      name: "锦秋集",
                      desc: "来自锦秋的 AI Insider",
                    },
                    {
                      name: "锦秋会",
                      desc: "一年一度的锦秋 CEO 大会",
                    },
                    {
                      name: "锦秋小饭桌",
                      desc: "创业者常态化闭门社交",
                    },
                  ].map((project) => (
                    <div key={project.name} className="p-4">
                      <p className="text-sm font-mono font-bold text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Library */}
            <section id="library" className="mb-12 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <BookOpen size={24} />
                研究库
              </h2>

              <div className="bg-muted border border-border rounded overflow-hidden">
                <div className="divide-y divide-border">
                  {[
                    {
                      name: "锦秋精选",
                      desc: "AI 报告解读与行业研究",
                    },
                    {
                      name: "锦秋扫描",
                      desc: "AI 产品测评（解锁 100 个效率场景）",
                    },
                  ].map((item) => (
                    <div key={item.name} className="p-4">
                      <p className="text-sm font-mono font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Contact */}
            <section id="contact" className="mb-2 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Mail size={24} />
                联系我们
              </h2>
              <p className="text-sm text-foreground mb-5">有任何投资合作或项目咨询的想法？我们期待听到你的声音。</p>
              <a
                href="mailto:contact@jinqiu.vc"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                → 发送邮件
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
