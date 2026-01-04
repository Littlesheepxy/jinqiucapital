import { NextRequest, NextResponse } from 'next/server'
import { supabase, checkSupabaseConfig } from '@/lib/supabase'
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
    // 检查 Supabase 配置，如果未配置则降级到文件系统
    if (!checkSupabaseConfig()) {
      console.log('📁 使用文件系统读取数据（Supabase 未配置）')
      const contentData = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
      const teamData = JSON.parse(fs.readFileSync(TEAM_FILE, 'utf-8'))
        
        return NextResponse.json({
          content: contentData,
          team: teamData
        })
    }

    // 从 Supabase 读取最新数据
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

    if (contentError || teamError) {
      console.error('Supabase read error:', { contentError, teamError })
      return NextResponse.json(
        { 
          error: 'Failed to read data from database',
          details: contentError?.message || teamError?.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      content: contentRecord?.data || {},
      team: teamRecord?.data || []
    })
  } catch (error) {
    console.error('Failed to read data:', error)
    return NextResponse.json(
      { error: 'Failed to read data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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

    // 如果 Supabase 未配置，降级到文件系统
    if (!checkSupabaseConfig()) {
      console.log('📁 使用文件系统保存数据（Supabase 未配置）')
      
    try {
      if (content) {
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
      }
      if (team) {
        fs.writeFileSync(TEAM_FILE, JSON.stringify(team, null, 2), 'utf-8')
      }
        
        return NextResponse.json({ 
          success: true,
          message: 'Data saved to file system (Supabase not configured)'
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
    const { data: currentContent } = await supabase
      .from('content')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const { data: currentTeam } = await supabase
      .from('team')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const nextContentVersion = (currentContent?.version || 0) + 1
    const nextTeamVersion = (currentTeam?.version || 0) + 1

    // 保存到版本历史
    const historyPromises = []
    
    if (content) {
      historyPromises.push(
        supabase.from('version_history').insert({
          data_type: 'content',
          data: content,
          version: nextContentVersion,
          description: description || `版本 ${nextContentVersion}`,
        })
      )
    }

    if (team) {
      historyPromises.push(
        supabase.from('version_history').insert({
          data_type: 'team',
          data: team,
          version: nextTeamVersion,
          description: description || `版本 ${nextTeamVersion}`,
        })
      )
    }

    await Promise.all(historyPromises)

    // 更新主表数据
    const updatePromises = []

    if (content) {
      // 删除旧记录
      await supabase.from('content').delete().neq('id', 0)
      
      // 插入新记录
      updatePromises.push(
        supabase.from('content').insert({
          data: content,
          version: nextContentVersion,
        })
      )
    }

    if (team) {
      // 删除旧记录
      await supabase.from('team').delete().neq('id', 0)
      
      // 插入新记录
      updatePromises.push(
        supabase.from('team').insert({
          data: team,
          version: nextTeamVersion,
        })
      )
    }

    const results = await Promise.all(updatePromises)

    // 检查是否有错误
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Update errors:', errors)
      return NextResponse.json(
        { 
          error: 'Failed to save data',
          details: errors.map(e => e.error?.message).join(', ')
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Data saved to Supabase',
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
