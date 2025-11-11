"use client"

import { Moon, Sun, Languages } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"

interface NavigationProps {
  isDark: boolean
  setIsDark: (v: boolean) => void
}

export default function Navigation({ isDark, setIsDark }: NavigationProps) {
  const { language, setLanguage } = useLanguage()
  const t = translations[language]
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="w-full flex items-center justify-between">
        <div className="px-4 lg:px-8 py-4 flex items-center">
          <a href="/" className="flex items-center gap-3">
            <img 
              src="/jinqiu-logo.png" 
              alt={t.nav.brandName}
              className="h-10"
            />
            <span className="text-xl font-bold text-foreground">{t.nav.brandName}</span>
          </a>
        </div>
        
        <div className="px-4 lg:px-8 py-4 flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
            className="px-3 py-1.5 hover:bg-muted rounded transition-colors text-foreground flex items-center gap-1.5 text-sm font-medium"
            aria-label="切换语言"
          >
            <Languages size={16} />
            <span>{language === "zh" ? "EN" : "中"}</span>
          </button>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-muted rounded transition-colors text-foreground"
            aria-label="切换深浅模式"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
