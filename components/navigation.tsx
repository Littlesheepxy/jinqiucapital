"use client"

import { Moon, Sun } from "lucide-react"

export default function Navigation({ isDark, setIsDark }: { isDark: boolean; setIsDark: (v: boolean) => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-bold text-primary">锦秋</div>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-muted rounded transition-colors text-foreground"
          aria-label="切换深浅模式"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  )
}
