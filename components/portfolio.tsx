"use client"

import { useState, useEffect } from "react"

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<any[]>([])

  useEffect(() => {
    fetch("/data/portfolio.json")
      .then((res) => res.json())
      .then((data) => setPortfolio(data))
  }, [])

  const categories = ["具身智能", "芯片", "应用"]

  return (
    <section className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto" style={{ maxWidth: "820px" }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: "#225BBA" }}>
          投资组合
        </h2>
        {categories.map((category) => {
          const items = portfolio.filter((p) => p.category === category)
          return (
            <div key={category} className="mb-12">
              <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors group"
                  >
                    <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded mb-3 flex items-center justify-center overflow-hidden">
                      {item.logo ? (
                        <img
                          src={item.logo || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">{item.name}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.name}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
