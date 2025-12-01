import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { get, getAll } from '@vercel/edge-config'

const CONTENT_FILE = path.join(process.cwd(), 'public/data/content.json')
const TEAM_FILE = path.join(process.cwd(), 'public/data/team.json')

// 简单的密码验证
function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'jinqiu2025'
  return password === adminPassword
}

// 判断是否使用 Edge Config（检查环境变量是否存在）
// 注意：Edge Config 可能有大小限制，推荐只在数据较小时使用
function hasEdgeConfig(): boolean {
  // 暂时禁用 Edge Config，因为发现有大小限制问题
  // 改用直接读写文件的方式
  return false
  // return !!process.env.EDGE_CONFIG
}

// GET: 获取内容数据
export async function GET(request: NextRequest) {
  try {
    // 如果配置了 Edge Config，从 Edge Config 读取
    if (hasEdgeConfig()) {
      try {
        // 使用 getAll 一次性读取所有数据（更高效）
        const edgeData = await getAll(['content', 'team'])
        
        // 如果 Edge Config 有数据，使用它；否则降级到文件系统
        const contentData = edgeData.content || JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
        const teamData = edgeData.team || JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
        
        return NextResponse.json({
          content: contentData,
          team: teamData
        })
      } catch (edgeError) {
        console.error('Edge Config read failed, falling back to file system:', edgeError)
        // 降级到文件系统
      }
    }
    
    // 从本地 JSON 文件读取（降级或本地开发）
    const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
    const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
    
    return NextResponse.json({
      content: contentData,
      team: teamData
    })
  } catch (error) {
    console.error('Failed to read data:', error)
    return NextResponse.json(
      { error: 'Failed to read data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 更新 Edge Config（使用 Vercel Management API）
async function updateEdgeConfig(content: any, team: any) {
  const edgeConfigId = process.env.EDGE_CONFIG_ID
  const vercelToken = process.env.VERCEL_API_TOKEN
  
  if (!edgeConfigId || !vercelToken) {
    console.error('Missing Edge Config credentials:', {
      hasEdgeConfigId: !!edgeConfigId,
      hasVercelToken: !!vercelToken
    })
    throw new Error('Edge Config credentials not configured')
  }

  console.log('Updating Edge Config:', edgeConfigId)

  const response = await fetch(
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          { operation: 'upsert', key: 'content', value: content },
          { operation: 'upsert', key: 'team', value: team },
        ],
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Edge Config update failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    throw new Error(`Failed to update Edge Config: ${response.status} ${errorText}`)
  }

  const result = await response.json()
  console.log('Edge Config update result:', result)
  return result
}

// POST: 保存内容数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, content, team } = body

    // 验证密码
    if (!verifyPassword(password)) {
      console.warn('Authentication failed: Invalid password')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    let edgeConfigUpdated = false

    // 如果配置了 Edge Config，更新到 Edge Config
    if (hasEdgeConfig()) {
      try {
        await updateEdgeConfig(content, team)
        edgeConfigUpdated = true
        console.log('✓ Edge Config updated successfully')
      } catch (error) {
        console.error('Failed to update Edge Config:', error)
        // 继续尝试保存到文件系统
      }
    }
    
    // 同时也保存到本地文件（作为备份和本地开发使用）
    try {
      if (content) {
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
      }

      if (team) {
        fs.writeFileSync(TEAM_FILE, JSON.stringify(team, null, 2), 'utf-8')
      }
      console.log('✓ JSON files updated successfully')
    } catch (fsError) {
      console.warn('Failed to write to file system (expected on Vercel):', fsError)
      // 在 Vercel 上文件系统写入会失败，但这是预期的
      if (!edgeConfigUpdated) {
        throw new Error('Failed to save data: both Edge Config and file system failed')
      }
    }

    return NextResponse.json({ 
      success: true,
      edgeConfigUpdated,
      message: edgeConfigUpdated ? 'Data saved to Edge Config' : 'Data saved to file system'
    })
  } catch (error) {
    console.error('Save operation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

