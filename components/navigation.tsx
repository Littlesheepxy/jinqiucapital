"use client"

import { Moon, Sun } from "lucide-react"
import Image from "next/image"

export default function Navigation({ isDark, setIsDark }: { isDark: boolean; setIsDark: (v: boolean) => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="w-full flex items-center justify-between">
        <div className="px-4 lg:px-8 py-4 flex items-center">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img 
              src="/jinqiu-logo.png" 
              alt="锦秋基金" 
              className="h-10"
            />
          </a>
        </div>
        
        {/* Dark Mode Toggle - 固定在右边 */}
        <div className="px-4 lg:px-8 py-4">
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
