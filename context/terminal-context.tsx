"use client"

import React, { createContext, useContext, useReducer, useRef } from "react"

export interface TerminalCommand {
  id: string
  command: string
  output: string[]
  timestamp: number
  duration: number
  module: string
  keyword: string
}

interface TerminalState {
  commands: TerminalCommand[]
  isExecuting: boolean
  isOpen: boolean  // 终端是否打开
  isMinimized: boolean  // 终端是否最小化
}

type TerminalAction =
  | { type: "ADD_COMMAND"; payload: Omit<TerminalCommand, "id" | "timestamp"> }
  | { type: "START_EXECUTION" }
  | { type: "FINISH_EXECUTION" }
  | { type: "TOGGLE_TERMINAL" }
  | { type: "MINIMIZE_TERMINAL" }
  | { type: "MAXIMIZE_TERMINAL" }
  | { type: "CLEAR_HISTORY" }

interface TerminalContextType {
  state: TerminalState
  executeCommand: (keyword: string, module: string) => void
  toggleTerminal: () => void
  minimizeTerminal: () => void
  maximizeTerminal: () => void
  clearHistory: () => void
  terminalRef: React.RefObject<HTMLDivElement | null>
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined)

function terminalReducer(state: TerminalState, action: TerminalAction): TerminalState {
  switch (action.type) {
    case "ADD_COMMAND":
      return {
        ...state,
        commands: [
          ...state.commands,
          {
            ...action.payload,
            id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
          },
        ],
      }
    case "START_EXECUTION":
      return {
        ...state,
        isExecuting: true,
      }
    case "FINISH_EXECUTION":
      return {
        ...state,
        isExecuting: false,
      }
    case "TOGGLE_TERMINAL":
      return {
        ...state,
        isOpen: !state.isOpen,
        isMinimized: false,  // 打开时总是展开状态
      }
    case "MINIMIZE_TERMINAL":
      return {
        ...state,
        isMinimized: true,
      }
    case "MAXIMIZE_TERMINAL":
      return {
        ...state,
        isMinimized: false,
      }
    case "CLEAR_HISTORY":
      return {
        ...state,
        commands: [],
      }
    default:
      return state
  }
}

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(terminalReducer, {
    commands: [],
    isExecuting: false,
    isOpen: false,
    isMinimized: false,
  })

  const terminalRef = useRef<HTMLDivElement>(null)

  const executeCommand = (keyword: string, module: string) => {
    console.log('🎯 executeCommand调用:', { keyword, module, currentState: state })
    
    // 导入命令数据
    import("@/lib/terminal-commands").then(({ terminalCommands }) => {
      const commandData = terminalCommands[module]?.[keyword]
      
      if (!commandData) {
        console.warn(`❌ Command not found: ${module} -> ${keyword}`)
        return
      }

      console.log('✅ 命令数据找到:', commandData)

      // 立即打开终端(如果未打开)
      if (!state.isOpen) {
        console.log('🔓 打开终端')
        dispatch({ type: "TOGGLE_TERMINAL" })
      }
      
      // 立即展开终端(如果最小化)
      if (state.isMinimized) {
        console.log('📖 展开终端')
        dispatch({ type: "MAXIMIZE_TERMINAL" })
      }

      console.log('⏳ 开始执行命令')
      dispatch({ type: "START_EXECUTION" })

      // 模拟命令执行
      setTimeout(() => {
        console.log('➕ 添加命令到历史')
        dispatch({
          type: "ADD_COMMAND",
          payload: {
            command: commandData.command,
            output: commandData.output,
            duration: commandData.duration,
            module,
            keyword,
          },
        })

        dispatch({ type: "FINISH_EXECUTION" })

        // 滚动到最新命令
        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
          }
        }, 100)
      }, 300)
    })
  }

  const toggleTerminal = () => {
    dispatch({ type: "TOGGLE_TERMINAL" })
  }

  const minimizeTerminal = () => {
    dispatch({ type: "MINIMIZE_TERMINAL" })
  }

  const maximizeTerminal = () => {
    dispatch({ type: "MAXIMIZE_TERMINAL" })
  }

  const clearHistory = () => {
    dispatch({ type: "CLEAR_HISTORY" })
  }

  return (
    <TerminalContext.Provider value={{ 
      state, 
      executeCommand, 
      toggleTerminal, 
      minimizeTerminal, 
      maximizeTerminal, 
      clearHistory, 
      terminalRef 
    }}>
      {children}
    </TerminalContext.Provider>
  )
}

export function useTerminal() {
  const context = useContext(TerminalContext)
  if (!context) {
    throw new Error("useTerminal must be used within TerminalProvider")
  }
  return context
}
