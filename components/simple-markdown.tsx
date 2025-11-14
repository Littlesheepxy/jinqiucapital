// 简单的 Markdown 渲染组件（支持加粗和换行）
export function SimpleMarkdown({ text }: { text: string }) {
  // 将 **文本** 转换为 <strong>文本</strong>
  const renderWithBold = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  // 按 \n 分段
  const paragraphs = text.split('\n').filter(p => p.trim())

  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} style={{ marginBottom: i < paragraphs.length - 1 ? "16px" : "0" }}>
          {renderWithBold(para)}
        </p>
      ))}
    </>
  )
}

