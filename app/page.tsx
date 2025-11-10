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
import FloatingTerminal from "@/components/floating-terminal"
import MarkdownView from "@/components/markdown-view"
import { TerminalProvider } from "@/context/terminal-context"
import { FileText, Zap, Users, Briefcase, BookOpen, Mail } from "lucide-react"

export default function Page() {
  const [isDark, setIsDark] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isMarkdownView, setIsMarkdownView] = useState(false)

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
    <TerminalProvider>
      <Navigation 
        isDark={isDark} 
        setIsDark={setIsDark} 
        isMarkdownView={isMarkdownView}
        onToggleView={() => setIsMarkdownView(!isMarkdownView)}
      />
      
      {/* Markdown视图 */}
      {isMarkdownView ? (
        <MarkdownView />
      ) : (
        <>
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
      
      {/* Floating Terminal */}
      <FloatingTerminal />
      </>
      )}
    </TerminalProvider>
  )
}
