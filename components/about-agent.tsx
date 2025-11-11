"use client"

import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"

export default function AboutAgent() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section id="about" className="scroll-mt-20 mb-12">
      <h2 className="text-2xl font-bold mb-8 text-foreground font-mono">
        <span className="text-[#225BBA]">#</span> {t.about.title}
      </h2>

      <div className="space-y-6 text-sm leading-relaxed">
        {t.about.content.map((content, index) => (
          <p
            key={index}
            className="text-slate-700 dark:text-slate-300"
          >
            {content}
          </p>
        ))}
      </div>
    </section>
  )
}

