"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Users, Linkedin, Twitter, X } from "lucide-react"
import ClickableKeyword from "./clickable-keyword"

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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

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

      {/* Compact Grid Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {teamData.map((member, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="relative group cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            {/* Compact Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 transition-all hover:border-[#225BBA] hover:shadow-md">
              {/* Small Avatar */}
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                style={{ background: getGradient(index) }}
              >
                {member.name.charAt(0)}
              </div>

              {/* Name */}
              <h3 className="font-semibold text-sm text-center text-foreground mb-1 truncate">
                <ClickableKeyword keyword={member.name} module="team">
                  {member.name}
                </ClickableKeyword>
              </h3>
              
              {/* Title */}
              <p className="text-xs text-center text-muted-foreground truncate">{member.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal for Member Details */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#225BBA] p-6 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl"
                style={{ background: getGradient(teamData.indexOf(selectedMember)) }}
              >
                {selectedMember.name.charAt(0)}
              </div>

              {/* Name & Title */}
              <h3 className="text-2xl font-bold text-center text-foreground mb-2">
                {selectedMember.name}
              </h3>
              <p className="text-center text-muted-foreground mb-1">{selectedMember.title}</p>
              <p className="text-center text-sm text-[#225BBA] font-mono mb-4">
                {selectedMember.focus}
              </p>

              {/* Links */}
              {(selectedMember.links.linkedin || selectedMember.links.x) && (
                <div className="flex gap-3 justify-center mb-4">
                  {selectedMember.links.linkedin && (
                    <a
                      href={selectedMember.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#225BBA] transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {selectedMember.links.x && (
                    <a
                      href={selectedMember.links.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#225BBA] transition-colors"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                {/* Command Style */}
                <div className="font-mono text-xs mb-3">
                  <span className="text-[#225BBA]">&gt;</span>{" "}
                  <span className="text-slate-500">profile.load(&quot;{selectedMember.name}&quot;)</span>
                </div>

                <div className="space-y-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[#225BBA]">→</span> 投资方向: {selectedMember.focus}
                  </div>
                  {selectedMember.projects.length > 0 && (
                    <div>
                      <span className="text-[#225BBA]">→</span> 过往项目: {selectedMember.projects.join("、")}
                    </div>
                  )}
                  {selectedMember.bio && (
                    <div className="text-slate-500 dark:text-slate-500 italic text-[11px] mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      {selectedMember.bio}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground font-mono">
        <span className="text-[#225BBA]">//</span> 16 人专业投资团队，覆盖 AI 应用、具身智能、算力等方向。
      </p>
    </section>
  )
}

