import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, checkConnection } from '@/lib/db'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'public/data/content.json')
const TEAM_FILE = path.join(process.cwd(), 'public/data/team.json')

// 简单的密码验证
function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'jinqiu2025'
  return password === adminPassword
}

// 检查数据库配置
function checkDbConfig(): boolean {
  return !!(process.env.DB_HOST || process.env.DB_NAME)
}

// GET: 获取内容数据
export async function GET(request: NextRequest) {
  try {
    // 检查数据库配置，如果未配置则降级到文件系统
    if (!checkDbConfig()) {
      console.log('📁 使用文件系统读取数据（数据库未配置）')
      const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
      const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
        
      return NextResponse.json({
        content: contentData,
        team: teamData
      })
    }

    // 检查数据库连接
    const connected = await checkConnection()
    if (!connected) {
      console.log('📁 数据库连接失败，使用文件系统')
      const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
      const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
        
      return NextResponse.json({
        content: contentData,
        team: teamData
      })
    }

    // 从 PostgreSQL 读取最新数据
    const contentRecord = await queryOne<{ data: any }>(
      'SELECT data FROM content ORDER BY version DESC LIMIT 1'
    )

    const teamRecord = await queryOne<{ data: any }>(
      'SELECT data FROM team ORDER BY version DESC LIMIT 1'
    )
    
    return NextResponse.json({
      content: contentRecord?.data || {},
      team: teamRecord?.data || []
    })
  } catch (error) {
    console.error('Failed to read data:', error)
    // 降级到文件系统
    try {
      const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
      const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
      return NextResponse.json({
        content: contentData,
        team: teamData
      })
    } catch {
      return NextResponse.json(
        { error: 'Failed to read data', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }
}

// POST: 保存内容数据（带版本历史）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, content, team, description } = body

    // 验证密码
    if (!verifyPassword(password)) {
      console.warn('Authentication failed: Invalid password')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // 如果数据库未配置，降级到文件系统
    if (!checkDbConfig()) {
      console.log('📁 使用文件系统保存数据（数据库未配置）')
      
      try {
        if (content) {
          fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
        }
        if (team) {
          fs.writeFileSync(TEAM_FILE, JSON.stringify(team, null, 2), 'utf-8')
        }
        
        return NextResponse.json({ 
          success: true,
          message: 'Data saved to file system (Database not configured)'
        })
      } catch (fsError) {
        console.error('Failed to write to file system:', fsError)
        return NextResponse.json(
          { error: 'Failed to save data', details: fsError instanceof Error ? fsError.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }

    // 获取当前版本号
    const currentContent = await queryOne<{ version: number }>(
      'SELECT version FROM content ORDER BY version DESC LIMIT 1'
    )

    const currentTeam = await queryOne<{ version: number }>(
      'SELECT version FROM team ORDER BY version DESC LIMIT 1'
    )

    const nextContentVersion = (currentContent?.version || 0) + 1
    const nextTeamVersion = (currentTeam?.version || 0) + 1

    // 保存到版本历史
    if (content) {
      await query(
        'INSERT INTO version_history (data_type, data, version, description) VALUES ($1, $2, $3, $4)',
        ['content', JSON.stringify(content), nextContentVersion, description || `版本 ${nextContentVersion}`]
      )
    }

    if (team) {
      await query(
        'INSERT INTO version_history (data_type, data, version, description) VALUES ($1, $2, $3, $4)',
        ['team', JSON.stringify(team), nextTeamVersion, description || `版本 ${nextTeamVersion}`]
      )
    }

    // 更新主表数据
    if (content) {
      // 删除旧记录
      await query('DELETE FROM content WHERE id > 0')
      
      // 插入新记录
      await query(
        'INSERT INTO content (data, version) VALUES ($1, $2)',
        [JSON.stringify(content), nextContentVersion]
      )
    }

    if (team) {
      // 删除旧记录
      await query('DELETE FROM team WHERE id > 0')
      
      // 插入新记录
      await query(
        'INSERT INTO team (data, version) VALUES ($1, $2)',
        [JSON.stringify(team), nextTeamVersion]
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Data saved to PostgreSQL',
      versions: {
        content: nextContentVersion,
        team: nextTeamVersion,
      }
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
