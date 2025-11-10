"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import HeroAgent from "@/components/hero-agent"
import AboutAgent from "@/components/about-agent"
import TeamAgent from "@/components/team-agent"
import PortfolioQuery from "@/components/portfolio-query"
import ProjectsModules from "@/components/projects-modules"
import LibrarySystem from "@/components/library-system"
import AgentInterface from "@/components/agent-interface"
import { FileText, Zap, Users, Briefcase, BookOpen, Mail } from "lucide-react"

export default function Page() {
  const [isDark, setIsDark] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

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

  // 监听滚动和按键
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasInteracted(true)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setHasInteracted(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <>
      <Navigation isDark={isDark} setIsDark={setIsDark} />
      <main className="min-h-screen bg-background text-foreground">
        {/* Hero Agent Section */}
        <HeroAgent onStartClick={() => setHasInteracted(true)} />
        
        {/* Main Content with Blur Overlay */}
        <div className="relative">
          {/* 模糊蒙版 */}
          {!hasInteracted && (
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-background/30 pointer-events-none transition-opacity duration-500" />
          )}
          
          <div className={`w-full py-8 md:py-12 px-4 lg:px-8 transition-all duration-500 ${!hasInteracted ? 'opacity-50' : 'opacity-100'}`}>
            <div className="border border-border rounded-lg bg-card p-8 md:p-10 lg:p-12">
            {/* README Header Tab */}
            <div className="flex items-center gap-4 pb-4 mb-8 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText size={16} />
                <span>README</span>
              </div>
              <div className="text-xs text-muted-foreground">MIT 许可证</div>
            </div>

            {/* About Jinqiu - Agent Style */}
            <AboutAgent />

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

            {/* Team - Agent Style */}
            <TeamAgent />

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Portfolio - Query Style */}
            <PortfolioQuery />

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Projects - Modules Style */}
            <ProjectsModules />

            {/* Divider */}
            <div className="border-t border-border my-10" />

            {/* Library - System Style */}
            <LibrarySystem />

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
        </div>
      </main>
      <Footer />
      
      {/* Agent Interface - Floating Button */}
      <AgentInterface />
    </>
  )
}
