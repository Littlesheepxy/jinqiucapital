"use client"

import { useTerminal } from "@/context/terminal-context"

interface ClickableKeywordProps {
  keyword: string
  module: string
  children: React.ReactNode
  className?: string
}

export default function ClickableKeyword({
  keyword,
  module,
  children,
  className = "",
}: ClickableKeywordProps) {
  const { executeCommand } = useTerminal()

  const handleClick = () => {
    executeCommand(keyword, module)
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer underline decoration-dotted underline-offset-4 hover:decoration-solid transition-all hover:text-[#225BBA] dark:hover:text-blue-400 ${className}`}
      title={`点击执行: ${keyword}`}
    >
      {children}
    </span>
  )
}
