"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import AboutAgent from "@/components/about-agent"
import TeamAgent from "@/components/team-agent"
import PortfolioQuery from "@/components/portfolio-query"
import ProjectsModules from "@/components/projects-modules"
import LibrarySystem from "@/components/library-system"
import { LanguageProvider, useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"
import { FileText, Mail } from "lucide-react"

function PageContent({ isDark, setIsDark }: { isDark: boolean; setIsDark: (v: boolean) => void }) {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <>
      <Navigation 
        isDark={isDark} 
        setIsDark={setIsDark}
      />
      
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="w-full py-8 md:py-12 px-4 lg:px-8">
          <div className="border border-border rounded-lg bg-card p-8 md:p-10 lg:p-12">
            <div className="flex items-center gap-4 pb-4 mb-8 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText size={16} />
                <span>{t.header.readme}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <a 
                  href={language === "zh" 
                    ? "https://creativecommons.org/licenses/by-nd/4.0/deed.zh-hans"
                    : "https://creativecommons.org/licenses/by-nd/4.0/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  title={language === "zh" 
                    ? "内容采用知识共享署名-禁止演绎 4.0 国际许可协议"
                    : "Content licensed under Creative Commons Attribution-NoDerivatives 4.0 International License"}
                >
                  {t.header.license}
                </a>
              </div>
            </div>

            <AboutAgent />
            <div className="border-t border-border my-10" />

            <TeamAgent />
            <div className="border-t border-border my-10" />

            <PortfolioQuery />
            <div className="border-t border-border my-10" />

            <ProjectsModules />
            <div className="border-t border-border my-10" />

            <LibrarySystem />
            <div className="border-t border-border my-10" />

            <section id="contact" className="mb-2 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Mail size={24} />
                {t.contact.title}
              </h2>
              <p className="text-sm text-foreground mb-5">{t.contact.description}</p>
              <a
                href="mailto:contact@jinqiucapital.com"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                → {t.contact.sendEmail}
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

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
    <LanguageProvider>
      <PageContent isDark={isDark} setIsDark={setIsDark} />
    </LanguageProvider>
  )
}
