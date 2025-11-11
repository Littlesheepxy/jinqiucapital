"use client"

import { Zap } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"

export default function ProjectsModules() {
  const { language } = useLanguage()
  const t = translations[language]
  
  const project = {
    link: "https://soli.jinqiucapital.com"
  }

  return (
    <section id="projects" className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-2 font-mono">
        <Zap size={24} className="text-[#225BBA]" />
        <span className="text-[#225BBA]">#</span> {t.projects.title}
      </h2>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-bold text-foreground mb-2">{t.projects.soli.name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t.projects.soli.summary}</p>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-[#225BBA] hover:underline"
        >
          {t.projects.visitLink} →
        </a>
      </div>
    </section>
  )
}

