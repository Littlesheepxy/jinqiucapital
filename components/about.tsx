export default function About() {
  return (
    <section className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto" style={{ maxWidth: "820px" }}>
        <h2 className="text-3xl font-bold mb-8" style={{ color: "#225BBA" }}>
          关于锦秋
        </h2>
        <div className="prose dark:prose-invert max-w-none mb-12 text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            锦秋基金是一家 <strong>AI-Native</strong> 的<strong>双币早期投资机构</strong>，专注于 <strong>AI
            应用</strong>、<strong>具身智能</strong>、<strong>算力与模型基础</strong>等前沿方向。我们与勇敢的创业者并肩作战——不仅提供资金支持，更将长期积累的<strong>产业洞察</strong>与<strong>实战经验</strong>引入企业成长的关键节点。我们以
            <strong>快决策</strong>捕捉创新窗口，以<strong>长期陪伴</strong>验证复利价值，并在确定性增强时
            <strong>持续增持</strong>表达投资信念。
          </p>
          <p>
            锦秋相信，在被智能重构的时代，我们投资的不只是公司，更是推动世界向前的<strong>勇气与想象力</strong>。
          </p>
        </div>

        {/* Data Cards */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { num: "12\u00a0年", label: "早期投资经验" },
            { num: "$1B+", label: "组合规模" },
            { num: "30+", label: "家被投企业" },
          ].map((card) => (
            <div
              key={card.label}
              className="p-6 rounded-lg border-2"
              style={{ backgroundColor: "#f5f7fa", borderColor: "#225BBA" }}
            >
              <div className="text-2xl font-bold mb-2" style={{ color: "#225BBA" }}>
                {card.num}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
