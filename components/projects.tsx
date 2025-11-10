"use client"

import { useState, useEffect } from "react"

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then((data) => setProjects(data))
  }, [])

  return (
    <section className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto" style={{ maxWidth: "820px" }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: "#225BBA" }}>
          项目矩阵
        </h2>
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold" style={{ color: "#225BBA" }}>
                  {project.name}
                </h3>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: "#f5f7fa", color: "#225BBA" }}
                >
                  more
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{project.summary}</p>
              {project.link && (
                <a href={project.link} className="text-sm font-semibold" style={{ color: "#225BBA" }}>
                  了解更多 →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
