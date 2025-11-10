"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import ClickableKeyword from "./clickable-keyword"

interface QA {
  question: string
  answer: string
  anchor: string
}

export default function AboutAgent() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const qaData: QA[] = [
    {
      question: "who is Jinqiu?",
      answer:
        "作为一家 **12 年期**的 **AI-Native** 基金，我们长期关注 **AI 应用**、**具身智能**、**算力基础与模型基础**等前沿方向，支持那些用智能推动人类**创造力延伸**与**效率重塑**的创业者。",
      anchor: "identity",
    },
    {
      question: "how do we partner?",
      answer:
        "我们始终与创始人**并肩同行**——不仅提供资金，更带来深度**产业洞察**与**实践经验**；不仅见证旅程，更参与每一次对新问题的**探索与定义**。",
      anchor: "partnership",
    },
    {
      question: "what do we believe?",
      answer:
        "我们以**快决策**捕捉创新窗口，以**长期陪伴**验证复利价值，以**增持投入**表达投资信念。锦秋相信，在被智能重构的时代，我们投资的不只是公司，而是推动世界向前的**勇气与想象力**；在不确定的时代，坚持做**最早理解变化的人**，做**最晚放弃信念的人**。",
      anchor: "belief",
    },
    {
      question: "our vision?",
      answer:
        "锦秋基金，持续与最具**方向感**与**创造力**的创业者一起，**率先抵达未来**。",
      anchor: "vision",
    },
  ]

  const stats = [
    { num: "12 年期", label: "基金周期" },
    { num: "60+", label: "被投企业" },
    { num: "AI-Native", label: "双币早期基金" },
  ]

  // 解析 markdown 加粗并添加可点击关键词
  const renderMarkdown = (text: string) => {
    const parts: React.ReactNode[] = []
    let remaining = text
    
    // 定义可点击的关键词
    const clickableKeywords = [
      { text: "AI 应用", module: "about" },
      { text: "具身智能", module: "about" },
      { text: "算力基础与模型基础", module: "about" },
      { text: "快决策", module: "about" },
    ]
    
    // 先移除markdown语法,提取加粗内容
    const boldPattern = /\*\*(.*?)\*\*/g
    const segments: { text: string; isBold: boolean }[] = []
    let lastIndex = 0
    let match
    
    while ((match = boldPattern.exec(text)) !== null) {
      // 添加非加粗部分
      if (match.index > lastIndex) {
        segments.push({ text: text.substring(lastIndex, match.index), isBold: false })
      }
      // 添加加粗部分
      segments.push({ text: match[1], isBold: true })
      lastIndex = match.index + match[0].length
    }
    // 添加剩余部分
    if (lastIndex < text.length) {
      segments.push({ text: text.substring(lastIndex), isBold: false })
    }
    
    // 处理每个segment
    segments.forEach((segment, segIndex) => {
      let processed = false
      
      // 检查是否包含可点击关键词
      for (const { text: keyword, module } of clickableKeywords) {
        if (segment.text.includes(keyword)) {
          const keywordIndex = segment.text.indexOf(keyword)
          
          // 前面的文本
          if (keywordIndex > 0) {
            const before = segment.text.substring(0, keywordIndex)
            parts.push(
              segment.isBold ? 
                <strong key={`bold-before-${segIndex}`} className="text-[#225BBA]">{before}</strong> :
                <span key={`before-${segIndex}`}>{before}</span>
            )
          }
          
          // 可点击关键词
          parts.push(
            <ClickableKeyword key={`keyword-${segIndex}`} keyword={keyword} module={module}>
              {segment.isBold ? <strong className="text-[#225BBA]">{keyword}</strong> : keyword}
            </ClickableKeyword>
          )
          
          // 后面的文本
          const after = segment.text.substring(keywordIndex + keyword.length)
          if (after) {
            parts.push(
              segment.isBold ?
                <strong key={`bold-after-${segIndex}`} className="text-[#225BBA]">{after}</strong> :
                <span key={`after-${segIndex}`}>{after}</span>
            )
          }
          
          processed = true
          break
        }
      }
      
      // 如果没有可点击关键词,直接渲染
      if (!processed) {
        parts.push(
          segment.isBold ?
            <strong key={`bold-${segIndex}`} className="text-[#225BBA]">{segment.text}</strong> :
            <span key={`text-${segIndex}`}>{segment.text}</span>
        )
      }
    })
    
    return <>{parts}</>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  }

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }

  return (
    <section id="about" className="scroll-mt-20 mb-12" ref={ref}>
      <motion.h2 
        className="text-2xl font-bold mb-8 text-foreground font-mono"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[#225BBA]">#</span> 关于锦秋
      </motion.h2>

      {/* Stats Section with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={statsVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            whileHover={{ 
              scale: 1.05,
              borderColor: "#225BBA",
              boxShadow: "0 10px 25px rgba(34, 91, 186, 0.1)"
            }}
            className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-900 text-center transition-colors cursor-pointer"
          >
            <motion.div 
              className="text-3xl font-bold text-[#225BBA] mb-2 font-mono"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: index * 0.15 + 0.3, duration: 0.5, ease: "backOut" }}
            >
              {stat.num}
            </motion.div>
            <motion.div 
              className="text-sm text-slate-600 dark:text-slate-400"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: index * 0.15 + 0.5 }}
            >
              {stat.label}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* CLI Style Q&A */}
      <motion.div
        className="mb-12 space-y-6 font-mono text-sm"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {qaData.map((qa, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              x: 8,
              transition: { duration: 0.3 }
            }}
            className="relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Question with Animation */}
            <motion.div 
              className="mb-2"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: index * 0.2 + 0.3 }}
            >
              <motion.span 
                className="text-[#225BBA] font-bold text-base"
                animate={hoveredIndex === index ? { x: [0, 3, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                &gt;{" "}
              </motion.span>
              <span className="text-slate-600 dark:text-slate-400">{qa.question}</span>
            </motion.div>

            {/* Answer with Fade-in */}
            <motion.div 
              className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 group-hover:border-[#225BBA] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 + 0.4 }}
            >
              <span className="text-[#225BBA] mr-2">→</span>
              <span className="text-slate-700 dark:text-slate-300">
                {renderMarkdown(qa.answer)}
              </span>
            </motion.div>

            {/* Copy Link Hint */}
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -right-2 top-0 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
              >
                /about#{qa.anchor}
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

