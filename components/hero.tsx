"use client"

export default function Hero() {
  return (
    <section className="pt-32 pb-12 px-6" style={{ backgroundColor: "#FAFAFA" }}>
      <div className="mx-auto text-center" style={{ maxWidth: "820px" }}>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: "#225BBA" }}>
          面向 AI 创业者的早期基金
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          锦秋基金是中国<strong className="text-slate-700 dark:text-slate-300">最为活跃</strong>的<strong className="text-slate-700 dark:text-slate-300">人工智能领域</strong><strong className="text-slate-700 dark:text-slate-300">早期投资机构</strong>之一。
        </p>
        <a
          href="#contact"
          className="inline-block px-8 py-3 rounded-lg font-semibold transition-all"
          style={{ backgroundColor: "#225BBA", color: "white" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          联系我们
        </a>
      </div>
    </section>
  )
}
