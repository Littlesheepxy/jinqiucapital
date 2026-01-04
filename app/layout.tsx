import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_SC } from "next/font/google"
import "./globals.css"

const noteSansSC = Noto_Sans_SC({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "锦秋基金 - Jinqiu Capital",
  description: "锦秋基金是一家 AI-Native 双币早期投资机构，长期投资勇敢的科技创业者，助力其造就伟大公司。关注 AI 应用、具身智能、算力与模型基础。",
  keywords: ["锦秋基金", "Jinqiu Capital", "风险投资", "VC", "AI投资", "早期投资", "科技投资"],
  authors: [{ name: "锦秋基金", url: "https://jinqiucapital.com" }],
  creator: "锦秋基金",
  publisher: "锦秋基金",
  icons: {
    icon: "/jinqiu-logo.png",
    shortcut: "/jinqiu-logo.png",
    apple: "/jinqiu-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    url: "https://jinqiucapital.com",
    siteName: "锦秋基金",
    title: "锦秋基金 - Jinqiu Capital",
    description: "AI-Native 双币早期投资机构，长期投资勇敢的科技创业者，助力其造就伟大公司。",
    images: [
      {
        url: "/jinqiu-logo.png",
        width: 512,
        height: 512,
        alt: "锦秋基金 Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "锦秋基金 - Jinqiu Capital",
    description: "AI-Native 双币早期投资机构",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://jinqiucapital.com",
    languages: {
      "zh-CN": "https://jinqiucapital.com?lang=zh",
      "en-US": "https://jinqiucapital.com?lang=en",
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 主要组织信息 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://jinqiucapital.com/#organization",
              name: "Jinqiu Capital",
              alternateName: "锦秋基金",
              url: "https://jinqiucapital.com",
              logo: {
                "@type": "ImageObject",
                url: "https://jinqiucapital.com/jinqiu-logo.png",
              },
              description: "锦秋基金是一家 AI-Native 双币早期投资机构，长期投资勇敢的科技创业者，助力其造就伟大公司。",
              foundingDate: "2020",
              areaServed: ["CN", "US"],
              knowsAbout: [
                "Venture Capital",
                "AI Investment",
                "Early Stage Investment",
                "Technology Startups",
                "Embodied AI",
                "AI Applications",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "ai@jinqiucapital.com",
                contactType: "general",
              },
            }),
          }}
        />
        {/* 网站信息 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://jinqiucapital.com/#website",
              url: "https://jinqiucapital.com",
              name: "锦秋基金 - Jinqiu Capital",
              description: "AI-Native 双币早期投资机构官方网站",
              publisher: {
                "@id": "https://jinqiucapital.com/#organization",
              },
              inLanguage: ["zh-CN", "en"],
              potentialAction: {
                "@type": "SearchAction",
                target: "https://jinqiucapital.com/library?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* AI 可读的机器接口提示 */}
        <link rel="alternate" type="application/json" href="/api/content" title="Company Data API" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt - AI readable site description" />
      </head>
      <body
        className={`${noteSansSC.className} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
      >
        {children}
      </body>
    </html>
  )
}
