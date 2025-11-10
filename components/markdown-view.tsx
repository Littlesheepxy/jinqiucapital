"use client"

import { FileText } from "lucide-react"

export default function MarkdownView() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">锦秋基金 / Jinqiu Capital</h1>
          <p className="text-muted-foreground">AI-Native 双币早期投资机构 · 12 年期基金</p>
        </div>

        {/* TL;DR */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FileText size={20} />
            TL;DR
          </h2>
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <p>你好，我是锦秋基金。</p>
            <p>一家 AI-Native 双币早期投资机构，12 年期基金。</p>
            <p>我们长期关注 AI 应用、具身智能、算力基础与模型基础等前沿方向。</p>
            <p>目前已投资 60+ 家企业。</p>
          </div>
        </section>

        {/* 关于锦秋 */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">关于锦秋</h2>
          
          <h3 className="text-xl font-semibold mb-3">who is Jinqiu?</h3>
          <p>
            作为一家 <strong>12 年期</strong>的 <strong>AI-Native</strong> 基金，我们长期关注 <strong>AI 应用</strong>、<strong>具身智能</strong>、<strong>算力基础与模型基础</strong>等前沿方向，支持那些用智能推动人类<strong>创造力延伸</strong>与<strong>效率重塑</strong>的创业者。
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">how we partner?</h3>
          <p>
            我们始终与创始人<strong>并肩同行</strong>——不仅提供资金，更带来深度<strong>产业洞察</strong>与<strong>实践经验</strong>；不仅见证旅程，更参与每一次对新问题的<strong>探索与定义</strong>。
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">what we believe?</h3>
          <p>
            我们以<strong>快决策</strong>捕捉创新窗口，以<strong>长期陪伴</strong>验证复利价值，以<strong>增持投入</strong>表达投资信念。锦秋相信，在被智能重构的时代，我们投资的不只是公司，而是推动世界向前的<strong>勇气与想象力</strong>；在不确定的时代，坚持做<strong>最早理解变化的人</strong>，做<strong>最晚放弃信念的人</strong>。
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">our vision?</h3>
          <p>
            锦秋基金，持续与最具<strong>方向感</strong>与<strong>创造力</strong>的创业者一起，<strong>率先抵达未来</strong>。
          </p>
        </section>

        {/* 关键信息 */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">关键信息</h2>
          
          <h3 className="text-lg font-semibold mb-3">身份定位</h3>
          <ul>
            <li>AI-Native</li>
            <li>Early-Stage</li>
            <li>Dual-Currency</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 mt-6">投资方向</h3>
          <ul>
            <li>AI 应用</li>
            <li>具身智能</li>
            <li>算力基础</li>
            <li>模型基础</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 mt-6">投资理念</h3>
          <ul>
            <li>快决策 (Fast Decision)</li>
            <li>长期陪伴 (Long-term Partnership)</li>
            <li>增持投入 (Follow-on Investment)</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 mt-6">核心数据</h3>
          <ul>
            <li>基金周期: 12 年期</li>
            <li>被投企业: 60+</li>
            <li>基金类型: AI-Native 双币早期基金</li>
          </ul>
        </section>

        {/* 联系方式 */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">联系我们</h2>
          <p>
            如果你是创业者，或对锦秋基金感兴趣，欢迎联系我们:
          </p>
          <p>
            <a href="mailto:hello@jinqiu.vc" className="text-[#225BBA] hover:underline">
              hello@jinqiu.vc
            </a>
          </p>
        </section>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 Jinqiu Capital. MIT License.</p>
        </div>
      </div>
    </div>
  )
}

