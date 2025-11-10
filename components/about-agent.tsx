"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"

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
      question: "how we partner?",
      answer:
        "我们始终与创始人**并肩同行**——不仅提供资金，更带来深度**产业洞察**与**实践经验**；不仅见证旅程，更参与每一次对新问题的**探索与定义**。",
      anchor: "partnership",
    },
    {
      question: "what we believe?",
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

  // 解析 markdown 加粗
  const renderMarkdown = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#225BBA]">$1</strong>')
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

  return (
    <section id="about" className="scroll-mt-20 mb-12" ref={ref}>
      <h2 className="text-2xl font-bold mb-8 text-foreground font-mono">
        <span className="text-[#225BBA]">#</span> 关于锦秋
      </h2>

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
            className="relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Question */}
            <div className="mb-2">
              <span className="text-[#225BBA] font-bold text-base">&gt; </span>
              <span className="text-slate-600 dark:text-slate-400">{qa.question}</span>
            </div>

            {/* Answer */}
            <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 group-hover:border-[#225BBA] transition-colors">
              <span className="text-[#225BBA] mr-2">→</span>
              <span
                className="text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(qa.answer) }}
              />
            </div>

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

      {/* Stats Cards with Number Animation */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={statVariants}
            className="bg-muted border-2 border-[#225BBA] rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <motion.div
              className="text-3xl font-bold mb-2 text-[#225BBA] font-mono"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
            >
              {stat.num}
            </motion.div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

