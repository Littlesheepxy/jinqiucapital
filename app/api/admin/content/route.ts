import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@vercel/edge-config'

const CONTENT_FILE = path.join(process.cwd(), 'public/data/content.json')
const TEAM_FILE = path.join(process.cwd(), 'public/data/team.json')

// 初始化 Edge Config（如果配置了的话）
const edgeConfig = process.env.EDGE_CONFIG ? createClient(process.env.EDGE_CONFIG) : null

// 简单的密码验证
function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'jinqiu2025'
  return password === adminPassword
}

// 判断是否使用 Edge Config
function useEdgeConfig(): boolean {
  return !!edgeConfig && !!process.env.EDGE_CONFIG
}

// GET: 获取内容数据
export async function GET(request: NextRequest) {
  try {
    // 如果配置了 Edge Config，从 Edge Config 读取
    if (useEdgeConfig() && edgeConfig) {
      const contentData = await edgeConfig.get('content')
      const teamData = await edgeConfig.get('team')
      
      return NextResponse.json({
        content: contentData || JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')),
        team: teamData || JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
      })
    }
    
    // 否则从本地 JSON 文件读取
    const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
    const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
    
    return NextResponse.json({
      content: contentData,
      team: teamData
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    )
  }
}

// 更新 Edge Config（使用 Vercel Management API）
async function updateEdgeConfig(content: any, team: any) {
  const edgeConfigId = process.env.EDGE_CONFIG_ID
  const vercelToken = process.env.VERCEL_API_TOKEN
  
  if (!edgeConfigId || !vercelToken) {
    throw new Error('Edge Config credentials not configured')
  }

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
    throw new Error('Failed to update Edge Config')
  }
}

// POST: 保存内容数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, content, team } = body

    // 验证密码
    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // 如果配置了 Edge Config，更新到 Edge Config
    if (useEdgeConfig()) {
      try {
        await updateEdgeConfig(content, team)
      } catch (error) {
        console.error('Failed to update Edge Config, falling back to file system', error)
        // 如果 Edge Config 更新失败，降级到文件系统
      }
    }
    
    // 同时也保存到本地文件（作为备份和本地开发使用）
    if (content) {
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
    }

    if (team) {
      fs.writeFileSync(TEAM_FILE, JSON.stringify(team, null, 2), 'utf-8')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    )
  }
}

