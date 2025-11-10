"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Bot, X, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Mode = "chat" | "json"

interface Message {
  type: "query" | "response"
  content: string
}

export default function AgentInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("chat")
  const [copied, setCopied] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // 预设问答
  const predefinedQA: Record<string, string> = {
    "有哪些AI应用方向的公司": "Soil 种子计划投资的应用型企业包括：流形空间、首形科技等。我们专注于种子期 AI 应用的专项投资。",
    "如何联系你们": "邮箱: contact@jinqiu.vc\n我们期待与优秀的 AI 创业者交流。",
    "投资方向": "我们专注于三大方向：**AI 应用**、**具身智能**、**算力与模型基础**。",
    help: "可用命令：\n- 有哪些AI应用方向的公司\n- 如何联系你们\n- 投资方向",
  }

  // JSON 数据
  const jsonData = {
    机构: "锦秋基金",
    定位: ["AI-Native", "Early-Stage", "Dual-Currency"],
    关注方向: ["AI 应用", "具身智能", "算力基础"],
    投资方法论: ["快决策", "长期陪伴", "增持投入"],
    项目: ["Soil", "Talent-Q", "锦秋集", "锦秋会", "锦秋小饭桌"],
    团队规模: "16人",
    组合规模: "$1B+",
    被投企业: "30+",
    联系方式: "contact@jinqiu.vc",
    API: {
      status: "预留接口",
      note: "未来可接入真实 AI Agent",
      endpoints: ["/api/query", "/api/portfolio", "/api/team"],
    },
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendMessage = () => {
    if (!currentInput.trim()) return

    const query = currentInput.trim()
    setMessages([...messages, { type: "query", content: query }])
    setCurrentInput("")
    setIsTyping(true)

    // 模拟打字延迟
    setTimeout(() => {
      // 查找匹配的回答
      let response = predefinedQA[query]
      if (!response) {
        // 模糊匹配
        const matchKey = Object.keys(predefinedQA).find((key) => query.includes(key) || key.includes(query))
        response = matchKey ? predefinedQA[matchKey] : "抱歉，我还不太理解这个问题。请尝试：help"
      }

      setMessages((prev) => [...prev, { type: "response", content: response }])
      setIsTyping(false)
    }, 800)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
      >
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <motion.button
              className="flex items-center gap-2 px-6 py-3 bg-[#225BBA] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow font-mono text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot size={20} />
              <span>For Agents</span>
            </motion.button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-mono text-[#225BBA] flex items-center gap-2">
                <Bot size={24} />
                Jinqiu Agent Interface
              </DialogTitle>
              <DialogDescription className="font-mono text-xs">
                机器可读模式 / 命令行交互界面
              </DialogDescription>
            </DialogHeader>

            {/* Mode Switcher */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("chat")}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                  mode === "chat"
                    ? "bg-[#225BBA] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                命令行交互
              </button>
              <button
                onClick={() => setMode("json")}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                  mode === "json"
                    ? "bg-[#225BBA] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                JSON 模式
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                {mode === "chat" ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full flex flex-col"
                  >
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-auto mb-4 space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-sm min-h-[300px]">
                      {messages.length === 0 && (
                        <div className="text-slate-500 dark:text-slate-500 text-center py-12">
                          <p className="mb-2">欢迎使用锦秋 Agent 交互界面</p>
                          <p className="text-xs">输入 &quot;help&quot; 查看可用命令</p>
                        </div>
                      )}

                      {messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {msg.type === "query" ? (
                            <div className="text-slate-700 dark:text-slate-300">
                              <span className="text-[#225BBA] font-bold">&gt;</span> 问锦秋: {msg.content}
                            </div>
                          ) : (
                            <div className="text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-[#225BBA]/30 whitespace-pre-line">
                              <span className="text-[#225BBA]">→</span> {msg.content}
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-slate-500 dark:text-slate-500 pl-4"
                        >
                          <span className="inline-block animate-pulse">正在输入...</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="输入你的问题..."
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-foreground font-mono text-sm focus:outline-none focus:border-[#225BBA]"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-6 py-2 bg-[#225BBA] text-white rounded-lg font-mono text-sm hover:opacity-90 transition-opacity"
                      >
                        发送
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* JSON Display */}
                    <div className="relative">
                      <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>

                      <pre className="bg-slate-900 dark:bg-slate-950 text-green-400 p-6 rounded-lg overflow-auto max-h-[500px] font-mono text-xs">
                        {JSON.stringify(jsonData, null, 2)}
                      </pre>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 font-mono">
                      <span className="text-[#225BBA]">//</span> 机器可读的结构化数据，可直接复制使用
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  )
}

