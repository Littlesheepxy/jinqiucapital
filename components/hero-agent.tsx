"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ClickableKeyword from "./clickable-keyword"

export default function HeroAgent({ onStartClick }: { onStartClick?: () => void }) {
  const [showButton, setShowButton] = useState(false)
  const [systemBooted, setSystemBooted] = useState(false)
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")

  const lines = [
    "你好，我是锦秋基金。",
    "一家 AI-Native 双币早期投资机构，12 年期基金。",
    "我们长期关注 AI 应用、具身智能、算力基础与模型基础等前沿方向。",
    "目前已投资 60+ 家企业。",
    "准备了解我们的故事吗？",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setSystemBooted(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!systemBooted || currentLineIndex >= lines.length) return

    const currentLine = lines[currentLineIndex]
    let charIndex = 0
    const typingSpeed = 40

    const typeChar = () => {
      if (charIndex <= currentLine.length) {
        setCurrentText(currentLine.slice(0, charIndex))
        charIndex++
        setTimeout(typeChar, typingSpeed)
      } else {
        // 当前行打完，等待后添加到完成列表
        setTimeout(() => {
          setDisplayedLines((prev) => [...prev, currentLine])
          setCurrentText("")
          setCurrentLineIndex(currentLineIndex + 1)
          
          if (currentLineIndex === lines.length - 1) {
            setShowButton(true)
          }
        }, 800)
      }
    }

    typeChar()
  }, [systemBooted, currentLineIndex])

  // 解析文本并渲染可点击的关键词
  const renderHighlightedText = (text: string) => {
    // 定义可点击的关键词(按优先级排序,避免冲突)
    const clickableKeywords = [
      { text: "AI-Native", module: "hero" },
      { text: "双币早期投资机构", module: "hero", keyword: "早期投资机构" }, // 匹配整个词组,但命令用"早期投资机构"
    ]
    
    // 其他高亮关键词
    const highlightKeywords = [
      "锦秋基金",
      "12 年期基金",
      "AI 应用",
      "具身智能",
      "算力基础与模型基础",
      "60+",
    ]
    
    let result: React.ReactNode[] = [text]
    
    // 处理每个可点击关键词
    clickableKeywords.forEach(({ text: searchText, module, keyword }) => {
      const newResult: React.ReactNode[] = []
      
      result.forEach((part) => {
        if (typeof part === 'string') {
          const segments = part.split(searchText)
          segments.forEach((segment, index) => {
            if (index > 0) {
              // 添加可点击关键词
              newResult.push(
                <ClickableKeyword 
                  key={`${keyword || searchText}-${Math.random()}`} 
                  keyword={keyword || searchText} 
                  module={module}
                >
                  {searchText}
                </ClickableKeyword>
              )
            }
            if (segment) {
              newResult.push(segment)
            }
          })
        } else {
          newResult.push(part)
        }
      })
      
      result = newResult
    })
    
    // 对字符串部分应用高亮
    const finalResult = result.map((part, index) => {
      if (typeof part === 'string') {
        let htmlString = part
        highlightKeywords.forEach((keyword) => {
          htmlString = htmlString.replace(
            new RegExp(keyword.replace("+", "\\+"), "g"),
            `<span class="text-[#225BBA] font-semibold">${keyword}</span>`
          )
        })
        return <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: htmlString }} />
      }
      return part
    })
    
    return <>{finalResult}</>
  }

  return (
    <section className="pt-32 pb-12 bg-[#FAFAFA] dark:bg-[#1a1a1a] min-h-[70vh] flex items-center">
      <div className="w-full px-4 lg:px-8">
        {/* Terminal Container */}
        <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm font-mono text-sm md:text-base relative max-w-[900px]">
          {/* System Boot Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-slate-500 dark:text-slate-400 mb-6"
          >
            [system] Booting Jinqiu Agent...
          </motion.div>

          {/* Main Content */}
          <div className="flex gap-4">
            {/* Line Numbers (decorative) */}
            <div className="text-slate-400 dark:text-slate-600 select-none hidden md:block text-right" style={{ minWidth: "24px" }}>
              {(displayedLines.length + (currentText ? 1 : 0) || 1) && 
                Array.from({ length: displayedLines.length + (currentText ? 1 : 0) || 1 }).map((_, i) => (
                  <div key={i} className="leading-[1.8]">
                    {i + 1}
                  </div>
                ))
              }
            </div>

            {/* Typed Content */}
            <div className="flex-1 space-y-0">
              {/* 已完成的行 */}
              {displayedLines.map((line, index) => (
                <div key={index} className="text-slate-800 dark:text-slate-200 leading-[1.8]">
                  <span className="text-[#225BBA] font-bold">&gt;</span>{" "}
                  {renderHighlightedText(line)}
                </div>
              ))}
              
              {/* 当前正在打字的行 */}
              {currentText && (
                <div className="text-slate-800 dark:text-slate-200 leading-[1.8]">
                  <span className="text-[#225BBA] font-bold">&gt;</span>{" "}
                  {renderHighlightedText(currentText)}
                  {!showButton && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                      className="inline-block w-2 h-5 bg-[#225BBA] ml-1 align-middle"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"
            >
              <a
                href="#about"
                onClick={() => onStartClick?.()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all text-white hover:opacity-90"
                style={{ backgroundColor: "#225BBA" }}
              >
                <span>→ 开始</span>
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

