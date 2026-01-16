// 清理 HTML 内容
function cleanHtml(html: string): string {
  if (!html) return ''
  return html
    // 移除零宽字符
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // 修复数字之间被插入的空格
    .replace(/(\d)\s+(\d)/g, '$1$2')
    // 规范化 &nbsp;
    .replace(/&nbsp;/g, ' ')
}

// 渲染 HTML 内容（来自富文本编辑器）
export function SimpleMarkdown({ text }: { text: string }) {
  const cleanedHtml = cleanHtml(text)
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: cleanedHtml }}
      style={{ 
        lineHeight: "1.6",
        wordBreak: "break-word"
      }}
    />
  )
}
