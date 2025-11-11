"use client"

import { Briefcase } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"

export default function PortfolioQuery() {
  const { language } = useLanguage()
  const t = translations[language]
  const totalSlots = 12

  return (
    <section id="portfolio" className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-2 font-mono">
        <Briefcase size={24} className="text-[#225BBA]" />
        <span className="text-[#225BBA]">#</span> {t.portfolio.title}
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Array.from({ length: totalSlots }).map((_, index) => (
          <div
            key={index}
            className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900/50"
          >
            <span className="text-slate-400 dark:text-slate-600 text-xs font-mono">{t.portfolio.tbd}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

