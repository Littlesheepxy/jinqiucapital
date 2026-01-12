"use client"

import { useState, useCallback, useRef } from "react"
import { useDebouncedCallback } from "use-debounce"
import type { ContentData, TeamMember, VersionHistoryItem } from "../types"

export function useAdminData() {
  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [teamData, setTeamData] = useState<TeamMember[]>([])
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [message, setMessage] = useState("")
  const [versionHistory, setVersionHistory] = useState<VersionHistoryItem[]>([])
  const hasUnsavedChanges = useRef(false)

  // 加载数据
  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/content")
      const data = await response.json()
      setContentData(data.content)
      setTeamData(data.team)
      loadVersionHistory()
    } catch (error) {
      setMessage("加载数据失败")
    }
  }

  // 加载版本历史
  const loadVersionHistory = async () => {
    try {
      const response = await fetch('/api/admin/versions?type=content&limit=50')
      if (response.ok) {
        const data = await response.json()
        const history = data.versions.map((v: any) => ({
          timestamp: new Date(v.created_at).getTime(),
          content: v.data_type === 'content' ? v.data : null,
          team: v.data_type === 'team' ? v.data : null,
          description: v.description || `版本 ${v.version}`,
          version: v.version,
          id: v.id,
        }))
        setVersionHistory(history)
      } else {
        const saved = localStorage.getItem('jinqiu_version_history')
        if (saved) {
          setVersionHistory(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.error('Failed to load version history:', error)
      try {
        const saved = localStorage.getItem('jinqiu_version_history')
        if (saved) {
          setVersionHistory(JSON.parse(saved))
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e)
      }
    }
  }

  // 本地草稿
  const checkForLocalDraft = () => {
    try {
      const draft = localStorage.getItem('jinqiu_local_draft')
      if (draft) {
        const draftData = JSON.parse(draft)
        const draftAge = Date.now() - draftData.timestamp
        return draftAge < 30 * 60 * 1000
      }
    } catch (error) {
      console.error('Failed to check local draft:', error)
    }
    return false
  }

  const loadLocalDraft = () => {
    try {
      const draft = localStorage.getItem('jinqiu_local_draft')
      if (draft) {
        const draftData = JSON.parse(draft)
        setContentData(draftData.content)
        setTeamData(draftData.team)
        hasUnsavedChanges.current = true
      }
    } catch (error) {
      console.error('Failed to load local draft:', error)
    }
  }

  const saveLocalDraft = useCallback(() => {
    try {
      const draft = {
        timestamp: Date.now(),
        content: contentData,
        team: teamData
      }
      localStorage.setItem('jinqiu_local_draft', JSON.stringify(draft))
    } catch (error) {
      console.error('Failed to save local draft:', error)
    }
  }, [contentData, teamData])

  const clearLocalDraft = () => {
    try {
      localStorage.removeItem('jinqiu_local_draft')
    } catch (error) {
      console.error('Failed to clear local draft:', error)
    }
  }

  // 版本操作
  const saveVersion = (description: string = '自动保存') => {
    try {
      const newVersion = {
        timestamp: Date.now(),
        content: contentData,
        team: teamData,
        description
      }
      const updatedHistory = [newVersion, ...versionHistory].slice(0, 20)
      setVersionHistory(updatedHistory)
      localStorage.setItem('jinqiu_version_history', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Failed to save version:', error)
    }
  }

  const restoreVersion = (timestamp: number, markAsChanged: () => void, setShowVersionHistory: (show: boolean) => void) => {
    const version = versionHistory.find(v => v.timestamp === timestamp)
    if (version) {
      if (confirm('确定要回滚到这个版本吗？当前未保存的更改将丢失。')) {
        setContentData(version.content)
        setTeamData(version.team)
        setMessage('✓ 已回滚到历史版本')
        setShowVersionHistory(false)
        markAsChanged()
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  const deleteVersion = (timestamp: number) => {
    if (confirm('确定要删除这个历史版本吗？')) {
      const updatedHistory = versionHistory.filter(v => v.timestamp !== timestamp)
      setVersionHistory(updatedHistory)
      localStorage.setItem('jinqiu_version_history', JSON.stringify(updatedHistory))
      setMessage('✓ 已删除历史版本')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const clearAllVersions = () => {
    if (confirm('确定要清空所有历史版本吗？此操作不可恢复。')) {
      setVersionHistory([])
      localStorage.removeItem('jinqiu_version_history')
      setMessage('✓ 已清空历史版本')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  // 保存操作
  const performSave = async (password: string, isAutoSave = false) => {
    if (isAutoSave) {
      setAutoSaving(true)
    } else {
      setSaving(true)
      setMessage("")
    }

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          content: contentData,
          team: teamData
        })
      })

      const result = await response.json()

      if (response.ok) {
        hasUnsavedChanges.current = false
        setLastSaved(new Date())
        
        const description = isAutoSave ? '自动保存' : '手动保存'
        saveVersion(description)
        clearLocalDraft()
        await loadData()
        
        if (!isAutoSave) {
          let saveMethod = 'Supabase 数据库'
          if (result.message) {
            if (result.message.includes('Supabase')) {
              if (result.versions) {
                setMessage(`✓ 保存成功！版本: content v${result.versions.content}, team v${result.versions.team}`)
              } else {
                setMessage(`✓ 保存成功到 ${saveMethod}！`)
              }
            } else if (result.message.includes('file system')) {
              setMessage(`✓ 保存成功到本地文件系统！（Supabase 未配置）`)
            } else {
              setMessage(`✓ ${result.message}`)
            }
          } else {
            setMessage(`✓ 保存成功到 ${saveMethod}！`)
          }
          setTimeout(() => setMessage(""), 5000)
        }
      } else {
        if (!isAutoSave) {
          const errorDetails = result.details ? `: ${result.details}` : ''
          setMessage(`❌ 保存失败${errorDetails}`)
        }
      }
    } catch (error) {
      if (!isAutoSave) {
        setMessage(`❌ 保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    } finally {
      if (isAutoSave) {
        setAutoSaving(false)
      } else {
        setSaving(false)
      }
    }
  }

  return {
    // 状态
    contentData,
    setContentData,
    teamData,
    setTeamData,
    saving,
    autoSaving,
    lastSaved,
    message,
    setMessage,
    versionHistory,
    hasUnsavedChanges,
    // 方法
    loadData,
    loadVersionHistory,
    checkForLocalDraft,
    loadLocalDraft,
    saveLocalDraft,
    clearLocalDraft,
    saveVersion,
    restoreVersion,
    deleteVersion,
    clearAllVersions,
    performSave,
  }
}
