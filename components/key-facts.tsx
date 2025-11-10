export default function KeyFacts() {
  const facts = [
    "AI-Native",
    "Early-Stage",
    "Dual-Currency",
    "AI 应用",
    "具身智能",
    "算力与模型基础",
    "快决策",
    "长期陪伴",
    "增持投入",
  ]

  return (
    <section className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto" style={{ maxWidth: "820px" }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: "#225BBA" }}>
          关键标签
        </h2>
        <div className="flex flex-wrap gap-4">
          {facts.map((fact) => (
            <span
              key={fact}
              className="px-4 py-2 rounded-full text-sm font-semibold border"
              style={{ borderColor: "#225BBA", color: "#225BBA" }}
            >
              {fact}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
