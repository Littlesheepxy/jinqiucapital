import { NextResponse } from 'next/server'
import { queryOne, checkConnection } from '@/lib/db'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'public/data/content.json')
const TEAM_FILE = path.join(process.cwd(), 'public/data/team.json')

// 检查数据库配置
function checkDbConfig(): boolean {
  return !!(process.env.DB_HOST || process.env.DB_NAME)
}

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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 可选：只获取 'team' 或 'content'
    // 优先从数据库读取
    if (checkDbConfig()) {
      try {
        const connected = await checkConnection()
        if (connected) {
          console.log('📊 从 PostgreSQL 读取公开数据...')
          
          const contentRecord = await queryOne<{ data: any }>(
            'SELECT data FROM content ORDER BY version DESC LIMIT 1'
          )

          const teamRecord = await queryOne<{ data: any }>(
            'SELECT data FROM team ORDER BY version DESC LIMIT 1'
          )
          
          if (contentRecord && teamRecord) {
            console.log('✅ 从 PostgreSQL 读取成功')
            // 过滤隐藏的栏目
            const filteredContent = filterHiddenItems(contentRecord.data || {})
            
            // 如果只请求 team 数据
            if (type === 'team') {
              return NextResponse.json(teamRecord.data || [])
            }
            
            return NextResponse.json({
              content: filteredContent,
              team: teamRecord.data || []
            })
          }
        }
        
        console.warn('⚠️ PostgreSQL 读取失败，降级到文件系统')
      } catch (dbError) {
        console.error('PostgreSQL 读取异常，降级到文件系统:', dbError)
      }
    }
    
    // 降级：从本地 JSON 文件读取
    console.log('📁 从文件系统读取数据...')
    const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
    const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
    
    // 过滤隐藏的栏目
    const filteredContent = filterHiddenItems(contentData)
    
    // 如果只请求 team 数据
    if (type === 'team') {
      return NextResponse.json(teamData)
    }
    
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
