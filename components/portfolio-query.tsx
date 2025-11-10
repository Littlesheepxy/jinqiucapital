"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Briefcase } from "lucide-react"

interface Company {
  name: string
  category: string
  logo: string | null
  url: string
  founders: Array<{ name: string; links: Record<string, string> }>
  description: string
  investmentDate: string
  tags: string[]
}

export default function PortfolioQuery() {
  const [portfolioData, setPortfolioData] = useState<Company[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("具身智能")
  const [queryComplete, setQueryComplete] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)

  const categories = ["具身智能", "芯片", "AI 应用"]

  useEffect(() => {
    fetch("/data/portfolio.json")
      .then((res) => res.json())
      .then((data) => setPortfolioData(data))
      .catch((err) => console.error("Failed to load portfolio data:", err))
  }, [])

  const filteredCompanies = portfolioData.filter((company) => company.category === selectedCategory)

  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory) return

    setIsQuerying(true)
    setQueryComplete(false)
    setSelectedCategory(category)

    // 模拟查询延迟
    setTimeout(() => {
      setQueryComplete(true)
      setIsQuerying(false)
    }, 600)
  }

  useEffect(() => {
    if (portfolioData.length > 0) {
      setQueryComplete(true)
    }
  }, [portfolioData])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
    <section id="portfolio" className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-2 font-mono">
        <Briefcase size={24} className="text-[#225BBA]" />
        <span className="text-[#225BBA]">#</span> 投资组合
      </h2>

      {/* Query Interface */}
      <div className="mb-6 font-mono text-sm">
        <div className="text-slate-600 dark:text-slate-400 mb-4">
          <span className="text-[#225BBA] font-bold">&gt;</span> query: portfolio.filter(category=&quot;
          <span className="text-[#225BBA]">{selectedCategory}</span>&quot;)
        </div>

        {isQuerying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 dark:text-slate-500 text-xs mb-2"
          >
            <span className="inline-block animate-pulse">正在查询...</span>
          </motion.div>
        )}

        {queryComplete && !isQuerying && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[#225BBA] mb-4"
          >
            <span className="font-bold">→</span> 返回结果: {filteredCompanies.length} 家公司
          </motion.div>
        )}

        {queryComplete && !isQuerying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-slate-500 dark:text-slate-500"
          >
            &gt; query complete.
          </motion.div>
        )}
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
              selectedCategory === category
                ? "bg-[#225BBA] text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Companies Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.name}
              variants={itemVariants}
              className="group relative border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 hover:border-[#225BBA] hover:shadow-lg transition-all"
            >
              {/* Company Name */}
              <h3 className="font-bold text-lg text-foreground mb-2 font-mono">{company.name}</h3>

              {/* Category Tag */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block px-2 py-1 bg-[#225BBA]/10 text-[#225BBA] text-xs rounded font-mono">
                  {company.category}
                </span>
                {company.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{company.description}</p>

              {/* Founders */}
              {company.founders.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                  创始人: {company.founders.map((f) => f.name).join(", ")}
                </p>
              )}

              {/* Hover Annotation */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                  💬 {company.investmentDate} 投资 · &quot;{company.description}&quot;
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

