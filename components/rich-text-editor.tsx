"use client"

import { useRef, useEffect } from "react"
import { Link, Link2, X, Image as ImageIcon } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  onImageUpload?: (file: File) => Promise<string>
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "200px", onImageUpload }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // 清理 HTML 内容
  const cleanHtml = (html: string): string => {
    return html
      // 移除零宽字符
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // 移除数字之间的空格（保留正常空格）
      .replace(/(\d)\s+(\d)/g, '$1$2')
      // 规范化空格
      .replace(/&nbsp;/g, ' ')
      // 移除多余的空 div/span
      .replace(/<(div|span)>\s*<\/\1>/g, '')
  }

  // 处理内容变化
  const handleInput = () => {
    if (editorRef.current) {
      const cleanedHtml = cleanHtml(editorRef.current.innerHTML)
      onChange(cleanedHtml)
    }
  }

  // 处理粘贴（去除格式，保留纯文本）
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    let text = e.clipboardData.getData('text/plain')
    // 清理粘贴的文本
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
    document.execCommand('insertText', false, text)
  }

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (onImageUpload) {
      try {
        const imageUrl = await onImageUpload(file)
        if (imageUrl) {
          execCommand("insertImage", imageUrl)
        }
      } catch (error) {
        console.error("图片上传失败:", error)
        alert("图片上传失败，请重试")
      }
    } else {
      // 如果没有上传函数，使用 base64
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          execCommand("insertImage", event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
    
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
          <Link size={16} /> 链接
        </button>
        <button
          type="button"
          onClick={() => execCommand("unlink")}
          style={toolbarButtonStyle}
          title="移除链接"
        >
          <Link2 size={16} /> 取消链接
        </button>
        <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          style={toolbarButtonStyle}
          title="清除格式"
        >
          <X size={16} /> 清除格式
        </button>
        <div style={{ width: "1px", backgroundColor: "#ddd", margin: "0 4px" }} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={toolbarButtonStyle}
          title="插入图片"
        >
          <ImageIcon size={16} /> 插入图片
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
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
          fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, -apple-system, sans-serif',
          backgroundColor: "white"
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #999;
        }

        /* 确保 emoji 正常显示，不被转换成图片 */
        [contentEditable] img.emoji {
          display: inline;
          height: 1em;
          width: 1em;
          vertical-align: middle;
          margin: 0 0.05em;
          border: 0;
        }

        /* 限制编辑区内的图片大小（不包括 emoji） */
        [contentEditable] img:not(.emoji) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }

        /* 防止 emoji 被自动转换 */
        [contentEditable] {
          -webkit-text-emphasis-style: none;
          text-emphasis-style: none;
          emoji-rendering: emoji;
          font-variant-emoji: emoji;
        }

        /* 确保文本中的 emoji 使用原生渲染 */
        [contentEditable] {
          font-family: inherit;
        }

        [contentEditable] * {
          font-family: inherit;
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

