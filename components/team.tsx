"use client"

import { useState, useEffect } from "react"

export default function Team() {
  const [team, setTeam] = useState<any[]>([])

  useEffect(() => {
    fetch("/data/team.json")
      .then((res) => res.json())
      .then((data) => setTeam(data))
  }, [])

  return (
    <section className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto" style={{ maxWidth: "820px" }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: "#225BBA" }}>
          团队 ({team.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="text-center group cursor-pointer">
              <div className="w-20 h-20 mx-auto mb-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                {member.avatar ? (
                  <img
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold text-white">{member.name.charAt(0)}</div>
                )}
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{member.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{member.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{member.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
