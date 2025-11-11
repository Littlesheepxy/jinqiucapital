"use client"

import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"

export default function Footer() {
  const { language } = useLanguage()
  const t = translations[language]
  
  return (
    <footer className="bg-muted border-t border-border py-12 px-6 md:px-10 lg:px-12">
      <div className="text-sm text-muted-foreground space-y-4">
        <p>
          {t.footer.copyright} ·{" "}
          <a href="/privacy" className="hover:text-primary transition-colors">
            {t.footer.privacy}
          </a>{" "}
          /{" "}
          <a href="/terms" className="hover:text-primary transition-colors">
            {t.footer.terms}
          </a>{" "}
          ·{" "}
          <a href="/sitemap.xml" className="hover:text-primary transition-colors">
            {t.footer.sitemap}
          </a>{" "}
          /{" "}
          <a href="/rss.xml" className="hover:text-primary transition-colors">
            RSS
          </a>{" "}
          /{" "}
          <a href="/api/data" className="hover:text-primary transition-colors">
            Data
          </a>
        </p>
        
        <div className="text-xs border-t border-border pt-4 space-y-2">
          <p>
            {t.footer.licenseText}
            <a 
              href={language === "zh" 
                ? "https://creativecommons.org/licenses/by-nd/4.0/deed.zh-hans"
                : "https://creativecommons.org/licenses/by-nd/4.0/"}
              target="_blank"
              rel="license noopener noreferrer"
              className="text-primary hover:underline mx-1"
            >
              {t.footer.licenseLink}
            </a>
          </p>
          <p>{t.footer.licenseDescription}</p>
          <p>{t.footer.builtFor}</p>
        </div>
      </div>
    </footer>
  )
}
