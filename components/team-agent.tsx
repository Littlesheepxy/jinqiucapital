"use client"

import { useState, useEffect } from "react"
import { Users, Linkedin, Twitter, X, Plus } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"

interface TeamMember {
  name: string | { zh: string; en: string }  // 支持旧格式和新格式
  title: string | { zh: string; en: string } // 支持旧格式和新格式
  title_zh?: string // 旧格式兼容
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
  const { language } = useLanguage()
  const t = translations[language]
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    // 优先从 API 读取数据库数据
    fetch("/api/content?type=team")
      .then((res) => res.json())
      .then((data) => {
        // API 返回 { team: [...] } 或直接返回数组
        const teamArray = data.team || data
        setTeamData(Array.isArray(teamArray) ? teamArray : [])
      })
      .catch((err) => {
        console.error("Failed to load team data from API:", err)
        // 降级到静态文件
        fetch("/data/team.json")
          .then((res) => res.json())
          .then((data) => setTeamData(data))
          .catch((err2) => console.error("Failed to load team data:", err2))
      })
  }, [])

  // 获取成员名称（兼容旧数据格式）
  const getMemberName = (member: TeamMember) => {
    if (typeof member.name === 'object' && member.name !== null) {
      return language === 'zh' ? (member.name.zh || member.name.en) : (member.name.en || member.name.zh)
    }
    return member.name || ''
  }

  // 获取成员职位（兼容旧数据格式）
  const getMemberTitle = (member: TeamMember) => {
    if (typeof member.title === 'object' && member.title !== null) {
      return language === 'zh' ? (member.title.zh || member.title.en) : (member.title.en || member.title.zh)
    }
    // 旧格式兼容
    if (language === 'zh' && member.title_zh) {
      return member.title_zh
    }
    return member.title || ''
  }

  // 获取名称首字母（用于头像）
  const getNameInitial = (member: TeamMember) => {
    const name = getMemberName(member)
    return name.charAt(0)
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
        <span className="text-[#225BBA]">#</span> {t.team.title}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {teamData.map((member, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900 hover:border-[#225BBA] hover:shadow-md">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                style={{ background: getGradient(index) }}
              >
                {getNameInitial(member)}
              </div>

              <h3 className="font-semibold text-sm text-center text-foreground mb-1 truncate">
                {getMemberName(member)}
              </h3>
              
              <p className="text-xs text-center text-muted-foreground truncate">
                {getMemberTitle(member)}
              </p>
            </div>
          </div>
        ))}

        <div className="relative group">
          <a
            href="https://lcn954pbr3v5.jobs.feishu.cn/967548"
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
          >
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 hover:border-[#225BBA] hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md h-full flex flex-col items-center justify-center cursor-pointer">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-[#225BBA] to-[#4facfe] text-white">
                <Plus size={24} />
              </div>

              <h3 className="font-semibold text-sm text-center text-[#225BBA] mb-1">
                {t.team.joinUs}
              </h3>
              
              <p className="text-xs text-center text-muted-foreground">
                {t.team.hiring}
              </p>
            </div>
          </a>
        </div>
      </div>

      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl border-2 border-[#225BBA] p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl"
              style={{ background: getGradient(teamData.indexOf(selectedMember)) }}
            >
              {getNameInitial(selectedMember)}
            </div>

            <h3 className="text-2xl font-bold text-center text-foreground mb-2">
              {getMemberName(selectedMember)}
            </h3>
            <p className="text-center text-muted-foreground mb-1">
              {getMemberTitle(selectedMember)}
            </p>
            <p className="text-center text-sm text-[#225BBA] font-mono mb-4">
              {selectedMember.focus}
            </p>

            {(selectedMember.links.linkedin || selectedMember.links.x) && (
              <div className="flex gap-3 justify-center mb-4">
                {selectedMember.links.linkedin && (
                  <a
                    href={selectedMember.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[#225BBA]"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
                {selectedMember.links.x && (
                  <a
                    href={selectedMember.links.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[#225BBA]"
                  >
                    <Twitter size={20} />
                  </a>
                )}
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="font-mono text-xs mb-3">
                <span className="text-[#225BBA]">&gt;</span>{" "}
                <span className="text-slate-500">profile.load(&quot;{getMemberName(selectedMember)}&quot;)</span>
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
          </div>
        </div>
      )}

    </section>
  )
}

