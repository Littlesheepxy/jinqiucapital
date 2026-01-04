export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">使用条款</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">1. 服务条款的接受</h2>
            <p className="text-muted-foreground">
              欢迎访问锦秋基金网站。通过访问和使用本网站，您同意遵守以下使用条款。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. 网站内容</h2>
            <p className="text-muted-foreground">
              本网站提供的所有内容仅供参考，不构成任何投资建议。投资决策应基于您自己的判断和尽职调查。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. 知识产权</h2>
            <p className="text-muted-foreground">
              本网站的所有内容，包括但不限于文本、图形、logo、图标、代码，均为锦秋基金或其内容提供者的财产，受中国和国际版权法保护。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. 免责声明</h2>
            <p className="text-muted-foreground">
              本网站按"现状"提供，不对网站内容的准确性、完整性或及时性做任何明示或暗示的保证。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. 链接</h2>
            <p className="text-muted-foreground">
              本网站可能包含指向第三方网站的链接。我们不对这些外部网站的内容或隐私做法负责。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. 条款变更</h2>
            <p className="text-muted-foreground">
              我们保留随时修改这些使用条款的权利。修改后的条款将在网站上发布时生效。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. 联系方式</h2>
            <p className="text-muted-foreground">
              如有任何问题，请联系我们：
              <a href="mailto:ai@jinqiucapital.com" className="text-primary hover:underline ml-1">
                ai@jinqiucapital.com
              </a>
            </p>
          </section>

          <p className="text-xs text-muted-foreground mt-8">
            最后更新日期：2025年1月1日
          </p>
        </div>

        <div className="mt-12">
          <a href="/" className="text-primary hover:underline">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}

