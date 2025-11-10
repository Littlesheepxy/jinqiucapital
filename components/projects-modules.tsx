"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Zap, ChevronDown } from "lucide-react"

interface Project {
  name: string
  nameEn: string
  summary: string
  link: string
  brand: {
    color: string
    icon: string
  }
  status: string
  cases: string[]
  details: string
}

export default function ProjectsModules() {
  const [projectsData, setProjectsData] = useState<Project[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then((data) => setProjectsData(data))
      .catch((err) => console.error("Failed to load projects data:", err))
  }, [])

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <section id="projects" className="mb-12 scroll-mt-20">
      <motion.h2 
        className="text-2xl font-bold mb-8 text-foreground flex items-center gap-2 font-mono"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          whileInView={{ rotate: 360 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Zap size={24} className="text-[#225BBA]" />
        </motion.div>
        <span className="text-[#225BBA]">#</span> 项目矩阵
      </motion.h2>

      {/* Module List Interface with Typing Effect */}
      <motion.div 
        className="mb-4 font-mono text-sm text-slate-600 dark:text-slate-400"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.span 
          className="text-[#225BBA] font-bold"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          &gt;
        </motion.span>{" "}
        modules.list()
      </motion.div>

      {/* Projects List */}
      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {projectsData.map((project, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 8px 20px rgba(34, 91, 186, 0.15)",
              transition: { duration: 0.3 }
            }}
            className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 hover:border-[#225BBA] transition-colors"
          >
            {/* Module Header - Clickable */}
            <motion.button
              onClick={() => toggleExpand(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Icon with Bounce */}
                <motion.span 
                  className="text-2xl"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  {project.brand.icon}
                </motion.span>

                {/* Module Info */}
                <div className="flex-1">
                  <div className="font-mono text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <motion.span 
                      className="text-[#225BBA]"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      →
                    </motion.span>{" "}
                    {project.name}
                    <span className="text-slate-400 dark:text-slate-600 ml-2">/ {project.nameEn}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{project.summary}</p>
                </div>
              </div>

              {/* Expand Icon with Rotation */}
              <motion.div
                animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown size={20} className="text-slate-400" />
              </motion.div>
            </motion.button>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4 bg-slate-50 dark:bg-slate-800/50">
                    {/* Command Line Display */}
                    <div className="font-mono text-sm space-y-2">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-600 dark:text-slate-400"
                      >
                        <span className="text-[#225BBA] font-bold">&gt;</span> module.open(&quot;
                        {project.nameEn.split(" ")[0]}&quot;)
                      </motion.div>

                      {/* Status */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-700 dark:text-slate-300"
                      >
                        <span className="text-[#225BBA]">→</span> 状态:{" "}
                        <span className="text-[#225BBA] font-semibold">{project.status}</span>
                      </motion.div>

                      {/* Cases */}
                      {project.cases.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-slate-700 dark:text-slate-300"
                        >
                          <span className="text-[#225BBA]">→</span> 案例: {project.cases.join("、")}
                        </motion.div>
                      )}

                      {/* Brand Color */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-700 dark:text-slate-300 flex items-center gap-2"
                      >
                        <span className="text-[#225BBA]">→</span> 品牌色:
                        <span
                          className="inline-block w-4 h-4 rounded"
                          style={{ backgroundColor: project.brand.color }}
                        />
                        <span className="text-xs text-slate-500">{project.brand.color}</span>
                      </motion.div>

                      {/* Details */}
                      {project.details && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-slate-600 dark:text-slate-400 text-xs mt-3 pl-4 border-l-2 border-[#225BBA]/30"
                        >
                          {project.details}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground font-mono mt-6">
        <span className="text-[#225BBA]">//</span> 所有模块均使用小写函数式语法，如 module.open()、module.status()
      </p>
    </section>
  )
}

