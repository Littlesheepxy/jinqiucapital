import { NextResponse } from 'next/server'
import { getAll } from '@vercel/edge-config'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'public/data/content.json')
const TEAM_FILE = path.join(process.cwd(), 'public/data/team.json')

// 公开的数据读取 API（无需密码）
export async function GET() {
  try {
    // 如果配置了 Edge Config，从 Edge Config 读取（生产环境）
    if (process.env.EDGE_CONFIG) {
      try {
        const edgeData = await getAll(['content', 'team'])
        
        if (edgeData.content || edgeData.team) {
          return NextResponse.json({
            content: edgeData.content || JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')),
            team: edgeData.team || JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
          })
        }
      } catch (edgeError) {
        console.error('Edge Config read failed, falling back to file system:', edgeError)
      }
    }
    
    // 从本地 JSON 文件读取（本地开发或降级）
    const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
    const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
    
    return NextResponse.json({
      content: contentData,
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

