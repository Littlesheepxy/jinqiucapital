"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import Highlight from "@tiptap/extension-highlight"
import { useEffect, useRef, useCallback } from "react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Palette,
  Highlighter,
  PaintBucket,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  onImageUpload?: (file: File) => Promise<string>
}

// 预设文字颜色
const COLORS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF",
  "#DC2626", "#EA580C", "#D97706", "#CA8A04",
  "#16A34A", "#059669", "#0D9488", "#0891B2",
  "#2563EB", "#4F46E5", "#7C3AED", "#9333EA",
  "#DB2777", "#E11D48", "#225BBA", "#1E40AF",
]

// 预设高亮/背景颜色
const HIGHLIGHT_COLORS = [
  { color: "#fef3c7", name: "黄色背景" },
  { color: "#dcfce7", name: "绿色背景" },
  { color: "#dbeafe", name: "蓝色背景" },
  { color: "#fce7f3", name: "粉色背景" },
  { color: "#f3e8ff", name: "紫色背景" },
  { color: "#fed7aa", name: "橙色背景" },
  { color: "#e5e7eb", name: "灰色背景" },
  { color: "transparent", name: "无背景" },
]

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "输入内容...", 
  minHeight = "200px", 
  onImageUpload 
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    immediatelyRender: false, // 避免 SSR 水合问题
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
        style: `min-height: ${minHeight}; padding: 12px;`,
      },
    },
  })

  // 同步外部 value 变化
  useEffect(() => {
    if (editor && !isInternalUpdate.current && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
    isInternalUpdate.current = false
  }, [value, editor])

  // 添加链接
  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("输入链接地址:", previousUrl || "https://")
    
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    if (onImageUpload) {
      try {
        const imageUrl = await onImageUpload(file)
        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run()
        }
      } catch (error) {
        console.error("图片上传失败:", error)
        alert("图片上传失败，请重试")
      }
    } else {
      // 使用 base64
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          editor.chain().focus().setImage({ src: event.target.result as string }).run()
        }
      }
      reader.readAsDataURL(file)
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 设置颜色
  const setColor = (color: string) => {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
  }

  if (!editor) {
    return <div style={{ minHeight, border: "1px solid #ddd", borderRadius: "8px" }}>加载中...</div>
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
      {/* 工具栏 */}
      <div style={{
        display: "flex",
        gap: "2px",
        padding: "8px",
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        {/* 撤销/重做 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="撤销"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="重做"
        >
          <Redo size={16} />
        </ToolbarButton>

        <Divider />

        {/* 标题 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="标题1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="标题2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="标题3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <Divider />

        {/* 文字格式 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="加粗"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="斜体"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="下划线"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="删除线"
        >
          <Strikethrough size={16} />
        </ToolbarButton>

        <Divider />

        {/* 文字颜色选择器 */}
        <div style={{ position: "relative" }}>
          <ColorPicker
            currentColor={editor.getAttributes("textStyle").color || "#000000"}
            onColorChange={setColor}
            icon={<Palette size={16} />}
            title="文字颜色"
          />
        </div>

        {/* 高亮/背景色选择器 */}
        <div style={{ position: "relative" }}>
          <HighlightPicker
            editor={editor}
          />
        </div>

        <Divider />

        {/* 对齐方式 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="左对齐"
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="居中"
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="右对齐"
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="两端对齐"
        >
          <AlignJustify size={16} />
        </ToolbarButton>

        <Divider />

        {/* 列表 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="无序列表"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="有序列表"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <Divider />

        {/* 引用和分割线 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分割线"
        >
          <Minus size={16} />
        </ToolbarButton>

        <Divider />

        {/* 链接 */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="插入链接"
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          title="移除链接"
        >
          <Unlink size={16} />
        </ToolbarButton>

        {/* 图片 */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="插入图片"
        >
          <ImageIcon size={16} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />

        <Divider />

        {/* 清除格式 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="清除格式"
        >
          <RemoveFormatting size={16} />
        </ToolbarButton>
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror {
          min-height: ${minHeight};
          padding: 12px;
          outline: none;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
        }
        
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.875rem 0 0.5rem;
        }
        
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
        }
        
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1rem 0;
        }
        
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0.5rem 0;
        }
        
        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
          font-family: monospace;
        }
        
        .ProseMirror pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }
        
        .ProseMirror pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

// 工具栏按钮组件
function ToolbarButton({ 
  children, 
  onClick, 
  active = false, 
  disabled = false,
  title 
}: { 
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "6px",
        border: "none",
        backgroundColor: active ? "#e5e7eb" : "transparent",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "#1f2937" : "#4b5563",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.backgroundColor = "#f3f4f6"
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent"
        }
      }}
    >
      {children}
    </button>
  )
}

// 分隔符
function Divider() {
  return (
    <div style={{ 
      width: "1px", 
      height: "20px", 
      backgroundColor: "#e5e7eb", 
      margin: "0 4px" 
    }} />
  )
}

// 文字颜色选择器
function ColorPicker({ 
  currentColor, 
  onColorChange,
  icon,
  title = "文字颜色"
}: { 
  currentColor: string
  onColorChange: (color: string) => void
  icon?: React.ReactNode
  title?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        style={{
          padding: "6px",
          border: "none",
          backgroundColor: isOpen ? "#e5e7eb" : "transparent",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {icon || <Palette size={16} />}
        <div style={{
          width: "14px",
          height: "14px",
          backgroundColor: currentColor,
          borderRadius: "2px",
          border: "1px solid #d1d5db",
        }} />
      </button>
      
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "4px",
          padding: "8px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 100,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "4px",
          width: "140px",
        }}>
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onColorChange(color)
                setIsOpen(false)
              }}
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: color,
                border: currentColor === color ? "2px solid #2563eb" : "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 高亮/背景色选择器
function HighlightPicker({ editor }: { editor: any }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  const currentHighlight = editor?.getAttributes("highlight")?.color || "transparent"

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const setHighlight = (color: string) => {
    if (color === "transparent") {
      editor.chain().focus().unsetHighlight().run()
    } else {
      editor.chain().focus().toggleHighlight({ color }).run()
    }
    setIsOpen(false)
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="背景高亮"
        style={{
          padding: "6px",
          border: "none",
          backgroundColor: isOpen ? "#e5e7eb" : "transparent",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Highlighter size={16} />
        <div style={{
          width: "14px",
          height: "14px",
          backgroundColor: currentHighlight === "transparent" ? "#fff" : currentHighlight,
          borderRadius: "2px",
          border: "1px solid #d1d5db",
        }} />
      </button>
      
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "4px",
          padding: "8px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 100,
          width: "160px",
        }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            选择背景色
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
            {HIGHLIGHT_COLORS.map((item) => (
              <button
                key={item.color}
                type="button"
                onClick={() => setHighlight(item.color)}
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: item.color === "transparent" ? "#fff" : item.color,
                  border: currentHighlight === item.color ? "2px solid #2563eb" : "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  position: "relative",
                }}
                title={item.name}
              >
                {item.color === "transparent" && (
                  <span style={{ 
                    position: "absolute", 
                    top: "50%", 
                    left: "50%", 
                    transform: "translate(-50%, -50%)",
                    fontSize: "16px",
                    color: "#999"
                  }}>
                    ✕
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 需要引入 React
import React from "react"
