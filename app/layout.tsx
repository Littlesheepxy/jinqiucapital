import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_SC } from "next/font/google"
import "./globals.css"

const noteSansSC = Noto_Sans_SC({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "锦秋基金 - Jinqiu Capital",
  description: "AI-Native 双币早期投资机构，关注 AI 应用、具身智能、算力与模型基础。",
  openGraph: {
    title: "锦秋基金 - Jinqiu Capital",
    description: "AI-Native 双币早期投资机构，关注 AI 应用、具身智能、算力与模型基础。",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VentureCapitalOrganization",
              name: "Jinqiu Capital",
              alternateName: "锦秋基金",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
              description: "AI-Native 双币早期投资机构，关注 AI 应用、具身智能、算力与模型基础。",
              sameAs: ["https://www.linkedin.com/company/jinqiu", "https://x.com/jinqiu"],
              areaServed: "CN",
            }),
          }}
        />
      </head>
      <body
        className={`${noteSansSC.className} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
      >
        {children}
      </body>
    </html>
  )
}
