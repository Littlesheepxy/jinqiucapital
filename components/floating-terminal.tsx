"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, X, Minus, Maximize2 } from "lucide-react"
import { useTerminal } from "@/context/terminal-context"

export default function FloatingTerminal() {
  const { state, terminalRef, minimizeTerminal, toggleTerminal } = useTerminal()
  const [streamedLines, setStreamedLines] = useState<string[]>([])
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(null)

  // 调试日志
  useEffect(() => {
    console.log('🖥️ FloatingTerminal state更新:', {
      isOpen: state.isOpen,
      commandsLength: state.commands.length,
      isExecuting: state.isExecuting,
      currentStreamingId
    })
  }, [state.isOpen, state.commands.length, state.isExecuting, currentStreamingId])

  // 流式输出动画
  useEffect(() => {
    console.log('🔄 流式输出useEffect触发:', {
      isOpen: state.isOpen,
      commandsLength: state.commands.length,
      currentStreamingId
    })
    
    // 必须在终端打开时才执行
    if (!state.isOpen || state.commands.length === 0) {
      console.log('⏸️ 跳过流式输出: 终端未打开或无命令')
      return
    }

    const latestCommand = state.commands[state.commands.length - 1]
    console.log('📦 最新命令:', latestCommand)
    
    // 如果这个命令还没有被流式输出过
    if (latestCommand.id !== currentStreamingId) {
      console.log('▶️ 开始新的流式输出:', latestCommand.id)
      setCurrentStreamingId(latestCommand.id)
      setStreamedLines([])
      
      const allLines = [
        `> ${latestCommand.command}`,
        "",
        ...latestCommand.output,
        "",
        `> completed in ${latestCommand.duration.toFixed(2)}s`,
        "",
      ]

      let currentLine = 0
      const streamInterval = setInterval(() => {
        if (currentLine < allLines.length) {
          setStreamedLines((prev) => [...prev, allLines[currentLine]])
          currentLine++
          
          // 自动滚动
          setTimeout(() => {
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight
            }
          }, 50)
        } else {
          clearInterval(streamInterval)
          console.log('✅ 流式输出完成')
        }
      }, 80)

      return () => {
        console.log('🧹 清理流式输出定时器')
        clearInterval(streamInterval)
      }
    } else {
      console.log('⏭️ 命令已流式输出过,跳过')
    }
    // 注意: 不要把currentStreamingId加入依赖数组,否则会导致定时器被立即清理
  }, [state.commands, state.isOpen, terminalRef])

  if (!state.isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          height: state.isMinimized ? "auto" : "500px"
        }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-50 w-[500px] max-w-[calc(100vw-3rem)] bg-slate-900 rounded-lg shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-green-400" />
            <span className="text-sm font-mono font-semibold text-white">
              jinqiu-terminal
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* 最小化按钮 */}
            {!state.isMinimized && (
              <button
                onClick={minimizeTerminal}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                aria-label="最小化"
              >
                <Minus size={14} />
              </button>
            )}
            
            {/* 关闭按钮 */}
            <button
              onClick={toggleTerminal}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
              aria-label="关闭"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content - 只在非最小化时显示 */}
        {!state.isMinimized && (
          <>
            {/* Terminal Content */}
            <div
              ref={terminalRef}
              className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-slate-900"
            >
              {state.commands.length === 0 ? (
                <div className="text-xs text-slate-500">
                  <p>欢迎使用锦秋终端 🚀</p>
                  <p className="mt-2">点击页面中带下划线的关键词以执行命令</p>
                  <p className="mt-4">
                    <span className="text-green-400">{">"}</span>{" "}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                      className="inline-block w-2 h-4 bg-green-400 ml-1"
                    />
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* 已完成的命令 */}
                  {state.commands.slice(0, -1).map((cmd) => (
                    <div key={cmd.id} className="text-xs text-slate-300 mb-3">
                      <div className="text-green-400 font-semibold">
                        {">"} {cmd.command}
                      </div>
                      <div className="ml-2 mt-1 space-y-0.5 text-slate-400">
                        {cmd.output.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>
                      <div className="ml-2 mt-1 text-slate-500 text-[10px]">
                        {">"} completed in {cmd.duration.toFixed(2)}s
                      </div>
                    </div>
                  ))}

                  {/* 当前流式输出的命令 */}
                  {streamedLines.map((line, idx) => (
                    <motion.div
                      key={`stream-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-xs ${
                        line.startsWith(">")
                          ? "text-green-400 font-semibold"
                          : line.startsWith("→")
                          ? "text-slate-400 ml-2"
                          : "text-slate-500 ml-2"
                      }`}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 闪烁光标 */}
              {state.commands.length > 0 && !state.isExecuting && (
                <motion.div
                  className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-xs text-green-400 font-semibold">{">"}</span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    className="inline-block w-2 h-4 ml-1 bg-green-400"
                  />
                </motion.div>
              )}

              {/* 执行中提示 */}
              {state.isExecuting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-yellow-400"
                >
                  {">"} executing...
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                {state.commands.length} command{state.commands.length !== 1 ? "s" : ""} executed
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-400">online</span>
              </div>
            </div>
          </>
        )}

        {/* 最小化状态 */}
        {state.isMinimized && (
          <button
            onClick={()=> {
              const { maximizeTerminal: maximize } = useTerminal()
              maximize()
            }}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <Maximize2 size={12} />
            <span>{state.commands.length} command{state.commands.length !== 1 ? "s" : ""}</span>
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

