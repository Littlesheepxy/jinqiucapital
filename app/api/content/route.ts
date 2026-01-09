import { NextResponse } from 'next/server'
import { supabase, checkSupabaseConfig } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'public/data/content.json')
const TEAM_FILE = path.join(process.cwd(), 'public/data/team.json')

// 过滤隐藏的栏目（仅用于公开 API）
function filterHiddenItems(content: any) {
  if (!content || !content.research || !content.research.list) {
    return content
  }
  
  return {
    ...content,
    research: {
      ...content.research,
      // 过滤掉 hidden 为 true 的栏目
      list: content.research.list.filter((item: any) => !item.hidden)
    }
  }
}

// 公开的数据读取 API（无需密码）
export async function GET() {
  try {
    // 优先从 Supabase 读取
    if (checkSupabaseConfig()) {
      try {
        console.log('📊 从 Supabase 读取公开数据...')
        
        const { data: contentRecord, error: contentError } = await supabase
          .from('content')
          .select('*')
          .order('version', { ascending: false })
          .limit(1)
          .single()

        const { data: teamRecord, error: teamError } = await supabase
          .from('team')
          .select('*')
          .order('version', { ascending: false })
          .limit(1)
          .single()
        
        if (!contentError && !teamError) {
          console.log('✅ 从 Supabase 读取成功')
          // 过滤隐藏的栏目
          const filteredContent = filterHiddenItems(contentRecord?.data || {})
          return NextResponse.json({
            content: filteredContent,
            team: teamRecord?.data || []
          })
        }
        
        console.warn('⚠️ Supabase 读取失败，降级到文件系统:', { contentError, teamError })
      } catch (supabaseError) {
        console.error('Supabase 读取异常，降级到文件系统:', supabaseError)
      }
    }
    
    // 降级：从本地 JSON 文件读取
    console.log('📁 从文件系统读取数据...')
    const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
    const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
    
    // 过滤隐藏的栏目
    const filteredContent = filterHiddenItems(contentData)
    
    return NextResponse.json({
      content: filteredContent,
      team: teamData
    })
  } catch (error) {
    console.error('Failed to read data:', error)
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    )
  }
}

// 设置缓存策略：在 Edge 上缓存，但可以快速更新
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // 始终获取最新数据

