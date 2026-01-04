export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">隐私政策</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">1. 信息收集</h2>
            <p className="text-muted-foreground">
              锦秋基金重视您的隐私。我们可能会收集您主动提供的信息，包括但不限于姓名、电子邮件地址、公司信息等。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. 信息使用</h2>
            <p className="text-muted-foreground">
              我们收集的信息将用于：
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>处理您的投资咨询请求</li>
              <li>发送相关的投资资讯和更新</li>
              <li>改善我们的服务质量</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. 信息保护</h2>
            <p className="text-muted-foreground">
              我们采取适当的技术和组织措施来保护您的个人信息，防止未经授权的访问、使用或披露。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Cookie 使用</h2>
            <p className="text-muted-foreground">
              本网站可能使用 Cookie 来改善用户体验。您可以通过浏览器设置管理 Cookie 偏好。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. 联系我们</h2>
            <p className="text-muted-foreground">
              如果您对本隐私政策有任何疑问，请通过 
              <a href="mailto:ai@jinqiucapital.com" className="text-primary hover:underline ml-1">
                ai@jinqiucapital.com
              </a> 联系我们。
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

