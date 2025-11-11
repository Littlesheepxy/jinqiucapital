"use client"

import { BookOpen } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"

export default function LibrarySystem() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section id="library" className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-2 font-mono">
        <BookOpen size={24} className="text-[#225BBA]" />
        <span className="text-[#225BBA]">#</span> {t.library.title}
      </h2>

      <div className="space-y-4">
        {t.library.items.map((item, index) => (
          <div
            key={index}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 bg-white dark:bg-slate-900"
          >
            <div className="mb-2">
              <span className="text-[#225BBA] font-mono mr-2">•</span>
              <span className="font-bold text-foreground">「{item.name}」</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 pl-5">
              {item.summary}
            </p>
            <a
              href="#"
              className="text-xs text-[#225BBA] hover:underline pl-5 inline-block"
            >
              「{t.library.more}」
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

