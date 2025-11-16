"use client"

import { useRef, useEffect } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "200px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // 初始化内容
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  // 执行格式化命令
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // 处理内容变化
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // 处理粘贴（去除格式）
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" }}>
      {/* 工具栏 */}
      <div style={{
        display: "flex",
        gap: "4px",
        padding: "8px",
        backgroundColor: "#f8f8f8",
        borderBottom: "1px solid #ddd",
        flexWrap: "wrap"
      }}>
        <button
          type="button"
          onClick={() => execCommand("bold")}
          style={toolbarButtonStyle}
          title="加粗 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          style={toolbarButtonStyle}
          title="斜体 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          style={toolbarButtonStyle}
          title="下划线 (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          style={toolbarButtonStyle}
          title="无序列表"
        >
          • 列表
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          style={toolbarButtonStyle}
          title="有序列表"
        >
          1. 列表
        </button>
        <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => execCommand("createLink", prompt("输入链接地址:", "https://") || undefined)}
          style={toolbarButtonStyle}
          title="插入链接"
        >
          🔗 链接
        </button>
        <button
          type="button"
          onClick={() => execCommand("unlink")}
          style={toolbarButtonStyle}
          title="移除链接"
        >
          ⛓️‍💥 取消链接
        </button>
        <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          style={toolbarButtonStyle}
          title="清除格式"
        >
          ✖️ 清除格式
        </button>
      </div>

      {/* 编辑区域 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        style={{
          minHeight,
          padding: "12px",
          outline: "none",
          lineHeight: "1.6",
          fontSize: "14px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "white"
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #999;
        }
      `}</style>
    </div>
  )
}

const toolbarButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #ddd",
  backgroundColor: "white",
  borderRadius: "3px",
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "4px"
}

