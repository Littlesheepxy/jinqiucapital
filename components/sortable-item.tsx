"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ReactNode } from "react"

interface SortableItemProps {
  id: string
  children: ReactNode
  disabled?: boolean
}

export function SortableItem({ id, children, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* 拖拽手柄 */}
        <button
          {...listeners}
          style={{
            cursor: disabled ? "not-allowed" : "grab",
            padding: "4px 8px",
            backgroundColor: "transparent",
            border: "1px solid #ddd",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: disabled ? "#ccc" : "#666",
          }}
          title="拖动排序"
        >
          ⋮⋮
        </button>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

// 隐藏/显示开关组件
interface VisibilityToggleProps {
  hidden: boolean
  onChange: (hidden: boolean) => void
  label?: string
}

export function VisibilityToggle({ hidden, onChange, label }: VisibilityToggleProps) {
  return (
    <button
      onClick={() => onChange(!hidden)}
      style={{
        padding: "4px 10px",
        backgroundColor: hidden ? "#f8d7da" : "#d4edda",
        color: hidden ? "#721c24" : "#155724",
        border: `1px solid ${hidden ? "#f5c6cb" : "#c3e6cb"}`,
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        whiteSpace: "nowrap",
      }}
      title={hidden ? "点击显示" : "点击隐藏"}
    >
      {hidden ? "👁️‍🗨️ 已隐藏" : "👁️ 显示中"}
      {label && <span>({label})</span>}
    </button>
  )
}

