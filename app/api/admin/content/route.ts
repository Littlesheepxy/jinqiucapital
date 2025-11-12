import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'public/data/content.json')
const TEAM_FILE = path.join(process.cwd(), 'public/data/team.json')

// 简单的密码验证
function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'jinqiu2025'
  return password === adminPassword
}

// GET: 获取内容数据
export async function GET(request: NextRequest) {
  try {
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

    // 保存内容数据
    if (content) {
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
    }

    // 保存团队数据
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

