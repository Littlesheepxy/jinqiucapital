"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Users, Linkedin, Twitter } from "lucide-react"

interface TeamMember {
  name: string
  title: string
  focus: string
  avatar: string | null
  links: {
    linkedin?: string
    x?: string
  }
  bio: string
  projects: string[]
}

export default function TeamAgent() {
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch("/data/team.json")
      .then((res) => res.json())
      .then((data) => setTeamData(data))
      .catch((err) => console.error("Failed to load team data:", err))
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  // 生成渐变背景作为头像占位符
  const getGradient = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <section id="team" className="mb-12 scroll-mt-20">
      <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-2 font-mono">
        <Users size={24} className="text-[#225BBA]" />
        <span className="text-[#225BBA]">#</span> 团队
      </h2>

      {/* Grid Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {teamData.map((member, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Card Container */}
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 transition-all hover:border-[#225BBA] hover:shadow-lg relative overflow-hidden">
              {/* Animated Outline on Hover */}
              {hoveredIndex === index && (
                <motion.div
                  className="absolute inset-0 border-2 border-[#225BBA] rounded-lg"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-white font-bold text-2xl"
                style={{ background: getGradient(index) }}
              >
                {member.name.charAt(0)}
              </div>

              {/* Basic Info */}
              <h3 className="font-bold text-lg text-foreground mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">{member.title}</p>
              <p className="text-xs text-[#225BBA] font-mono mb-3">{member.focus}</p>

              {/* Links */}
              {(member.links.linkedin || member.links.x) && (
                <div className="flex gap-2 mb-3">
                  {member.links.linkedin && (
                    <a
                      href={member.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#225BBA] transition-colors"
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {member.links.x && (
                    <a
                      href={member.links.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#225BBA] transition-colors"
                    >
                      <Twitter size={16} />
                    </a>
                  )}
                </div>
              )}

              {/* Hover Details */}
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3"
                >
                  {/* Command Style Description */}
                  <div className="font-mono text-xs mb-2">
                    <span className="text-[#225BBA]">&gt;</span>{" "}
                    <span className="text-slate-500">profile.load(&quot;{member.name}&quot;)</span>
                  </div>

                  <div className="font-mono text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="text-[#225BBA]">→</span> 投资方向: {member.focus}
                    </motion.div>
                    {member.projects.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-[#225BBA]">→</span> 过往项目: {member.projects.join("、")}
                      </motion.div>
                    )}
                    {member.bio && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 dark:text-slate-500 italic text-[10px] mt-2"
                      >
                        {member.bio}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground font-mono">
        <span className="text-[#225BBA]">//</span> 16 人专业投资团队，覆盖 AI 应用、具身智能、芯片等方向。
      </p>
    </section>
  )
}

