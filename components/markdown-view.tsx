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

        {/* 团队 */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">团队</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">管理团队</h3>
              <ul className="space-y-1">
                <li><strong>杨洁</strong> - Founding Partner</li>
                <li><strong>臧天宇</strong> - Partner</li>
                <li><strong>郑晓超</strong> - Partner</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">投资团队</h3>
              <ul className="space-y-1">
                <li><strong>杨秉慧</strong> - Investor</li>
                <li><strong>石亚琼</strong> - Investor</li>
                <li><strong>周欣</strong> - Investor</li>
                <li><strong>龙杰</strong> - Investor</li>
                <li><strong>廖智媛</strong> - Investor</li>
                <li><strong>施立成</strong> - Investor</li>
                <li><strong>谢昊翔</strong> - Investor</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">职能团队</h3>
              <ul className="space-y-1">
                <li><strong>李轻舟</strong> - Financial Manager</li>
                <li><strong>乔众龙</strong> - Financial Manager</li>
                <li><strong>谭逸</strong> - Legal Manager</li>
                <li><strong>张旭</strong> - HR Manager</li>
                <li><strong>肖杨</strong> - Product Manager</li>
                <li><strong>马梦真</strong> - Branding Manager</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 投资组合 */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">投资组合</h2>
          <p className="mb-4">锦秋基金已投资 60+ 家优秀企业，覆盖AI应用、具身智能、算力基础等多个领域。</p>
          
          <h3 className="text-lg font-semibold mb-3 mt-6">AI 应用</h3>
          <p className="text-sm text-muted-foreground mb-2">从底层技术到应用场景的全面布局</p>
          <ul>
            <li>智能办公与协作工具</li>
            <li>AI驱动的设计与创作平台</li>
            <li>垂直领域智能化解决方案</li>
            <li>AI内容生成与分析</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 mt-6">具身智能</h3>
          <p className="text-sm text-muted-foreground mb-2">投资智能机器人与自动化领域</p>
          <ul>
            <li>人形机器人与服务机器人</li>
            <li>工业自动化与智能制造</li>
            <li>自动驾驶与智能交通</li>
            <li>智能物流与配送系统</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 mt-6">算力基础</h3>
          <p className="text-sm text-muted-foreground mb-2">支持AI发展的算力与基础设施</p>
          <ul>
            <li>AI芯片(GPU/NPU/ASIC)</li>
            <li>云计算与边缘计算平台</li>
            <li>算力调度与优化</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 mt-6">模型基础</h3>
          <p className="text-sm text-muted-foreground mb-2">大模型与AI框架领域投资</p>
          <ul>
            <li>大语言模型(LLM)</li>
            <li>多模态模型</li>
            <li>AI开发框架与工具链</li>
          </ul>
        </section>

        {/* 项目与模块 */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">开源项目</h2>
          <p className="mb-4">我们支持并参与多个开源项目，推动AI技术的发展和应用。</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">jinqiu-ai-framework</h3>
              <p className="text-sm text-muted-foreground">轻量级AI应用开发框架</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">portfolio-tracker</h3>
              <p className="text-sm text-muted-foreground">投资组合管理工具</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">ai-benchmarks</h3>
              <p className="text-sm text-muted-foreground">AI模型性能评测平台</p>
            </div>
          </div>
        </section>

        {/* 知识库 */}
        <section className="mb-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">知识库</h2>
          <p className="mb-4">分享我们对AI行业的思考和洞察。</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                <a href="#" className="text-[#225BBA] hover:underline">
                  AI应用的下一个十年
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">2024-12-15</p>
              <p className="text-sm">探讨AI应用的发展趋势和投资机会</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                <a href="#" className="text-[#225BBA] hover:underline">
                  具身智能：从实验室到产业
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">2024-11-20</p>
              <p className="text-sm">分析具身智能的技术突破和商业化路径</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                <a href="#" className="text-[#225BBA] hover:underline">
                  算力基础设施的变革
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">2024-10-10</p>
              <p className="text-sm">深入解析AI时代的算力需求和供给</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                <a href="#" className="text-[#225BBA] hover:underline">
                  大模型的商业化之路
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">2024-09-05</p>
              <p className="text-sm">讨论大语言模型的商业模式和盈利路径</p>
            </div>
          </div>
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

