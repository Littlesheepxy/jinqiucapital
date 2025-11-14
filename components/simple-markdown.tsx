// 渲染 HTML 内容（来自富文本编辑器）
export function SimpleMarkdown({ text }: { text: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: text }}
      style={{ 
        lineHeight: "1.6",
        wordBreak: "break-word"
      }}
    />
  )
}
