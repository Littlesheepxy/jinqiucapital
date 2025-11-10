"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { BookOpen, Search, FileText } from "lucide-react"

interface LibraryItem {
  name: string
  nameCn: string
  summary: string
  link: string
  tags: string[]
  path: string
  date: string
}

export default function LibrarySystem() {
  const [libraryData, setLibraryData] = useState<LibraryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch("/data/library.json")
      .then((res) => res.json())
      .then((data) => setLibraryData(data))
      .catch((err) => console.error("Failed to load library data:", err))
  }, [])

  // 获取所有唯一标签
  const allTags = Array.from(new Set(libraryData.flatMap((item) => item.tags)))

  // 过滤逻辑
  const filteredLibrary = libraryData.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameCn.includes(searchQuery) ||
      item.summary.includes(searchQuery) ||
      item.tags.some((tag) => tag.includes(searchQuery))

    const matchesTag = selectedTag === null || item.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <section id="library" className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-2 font-mono">
        <BookOpen size={24} className="text-[#225BBA]" />
        <span className="text-[#225BBA]">#</span> 研究库
      </h2>

      {/* Access Interface */}
      <div className="mb-6 font-mono text-sm">
        <div className="text-slate-600 dark:text-slate-400 mb-4">
          <span className="text-[#225BBA] font-bold">&gt;</span> access: /library
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="search in Jinqiu Library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-foreground font-mono text-sm focus:outline-none focus:border-[#225BBA] transition-colors"
          />
        </div>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              selectedTag === null
                ? "bg-[#225BBA] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                selectedTag === tag
                  ? "bg-[#225BBA] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Library Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${searchQuery}-${selectedTag}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="space-y-4"
        >
          {filteredLibrary.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-slate-500 dark:text-slate-500 font-mono text-sm"
            >
              <span className="text-[#225BBA]">//</span> 没有找到匹配的内容
            </motion.div>
          ) : (
            filteredLibrary.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-900 hover:border-[#225BBA] hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* File Icon */}
                  <div className="mt-1">
                    <FileText className="text-[#225BBA]" size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Title */}
                    <div className="mb-2">
                      <h3 className="font-mono font-bold text-lg text-foreground inline mr-2">{item.name}</h3>
                      <span className="text-sm text-slate-500 dark:text-slate-500">· {item.nameCn}</span>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{item.summary}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-[#225BBA]/10 text-[#225BBA] text-xs rounded font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Path Display on Hover */}
                    {hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700"
                      >
                        <span className="text-[#225BBA]">→</span> {item.path}/report-{item.date}.md
                      </motion.div>
                    )}

                    {/* Date */}
                    <div className="mt-3 text-xs text-slate-400 dark:text-slate-600 font-mono">
                      更新时间: {item.date}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground font-mono mt-8">
        <span className="text-[#225BBA]">//</span> 支持关键词搜索和标签筛选，所有内容均可通过路径直接访问
      </p>
    </section>
  )
}

