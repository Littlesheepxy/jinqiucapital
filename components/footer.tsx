export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border py-12 px-6 md:px-10 lg:px-12">
      <div className="text-sm text-muted-foreground">
        <p className="mb-3">
          © 2025 锦秋基金 ·{" "}
          <a href="#" className="hover:text-primary transition-colors">
            隐私政策
          </a>{" "}
          /{" "}
          <a href="#" className="hover:text-primary transition-colors">
            使用条款
          </a>{" "}
          ·{" "}
          <a href="/sitemap.xml" className="hover:text-primary transition-colors">
            网站地图
          </a>{" "}
          /{" "}
          <a href="/rss.xml" className="hover:text-primary transition-colors">
            RSS
          </a>{" "}
          /{" "}
          <a href="/data" className="hover:text-primary transition-colors">
            数据
          </a>
        </p>
        <p className="text-xs">为 AI Agent 发现而构建</p>
      </div>
    </footer>
  )
}
