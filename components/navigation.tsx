"use client"

import { Moon, Sun, Terminal, FileText } from "lucide-react"
import Image from "next/image"
import { useTerminal } from "@/context/terminal-context"

interface NavigationProps {
  isDark: boolean
  setIsDark: (v: boolean) => void
  isMarkdownView?: boolean
  onToggleView?: () => void
}

export default function Navigation({ isDark, setIsDark, isMarkdownView = false, onToggleView }: NavigationProps) {
  const terminalContext = useTerminal()
  
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
        
        {/* Right Controls - Markdown视图 + 终端 + 深色模式 */}
        <div className="px-4 lg:px-8 py-4 flex items-center gap-2">
          {/* Markdown View Toggle */}
          {onToggleView && (
            <button
              onClick={onToggleView}
              className="p-2 hover:bg-muted rounded transition-colors text-foreground"
              aria-label={isMarkdownView ? "切换到交互模式" : "切换到Markdown模式"}
              title={isMarkdownView ? "交互模式" : "Markdown模式"}
            >
              <FileText size={18} />
            </button>
          )}
          
          {/* Terminal Toggle - 只在交互模式显示 */}
          {!isMarkdownView && terminalContext && (
            <button
              onClick={terminalContext.toggleTerminal}
              className="p-2 hover:bg-muted rounded transition-colors text-foreground"
              aria-label="切换终端"
            >
              <Terminal size={18} />
            </button>
          )}
          
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
