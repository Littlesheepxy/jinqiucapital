import { NextRequest, NextResponse } from 'next/server'
import { query, checkConnection } from '@/lib/db'

// 检查数据库配置
function checkDbConfig(): boolean {
  return !!(process.env.DB_HOST || process.env.DB_NAME)
}

// GET: 获取版本历史
export async function GET(request: NextRequest) {
  try {
    // 如果数据库未配置，返回空列表
    if (!checkDbConfig()) {
      return NextResponse.json({ versions: [] })
    }

    const connected = await checkConnection()
    if (!connected) {
      return NextResponse.json({ versions: [] })
    }

    const searchParams = request.nextUrl.searchParams
    const dataType = searchParams.get('type') // 'content' 或 'team'
    const limit = parseInt(searchParams.get('limit') || '20')

    let sql = 'SELECT * FROM version_history'
    const params: any[] = []
    let paramIndex = 1

    if (dataType && (dataType === 'content' || dataType === 'team')) {
      sql += ` WHERE data_type = $${paramIndex++}`
      params.push(dataType)
    }

    sql += ' ORDER BY created_at DESC'
    sql += ` LIMIT $${paramIndex}`
    params.push(limit)

    const data = await query(sql, params)

    return NextResponse.json({ versions: data || [] })
  } catch (error) {
    console.error('Version history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch version history', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE: 删除版本历史
export async function DELETE(request: NextRequest) {
  try {
    // 如果数据库未配置，返回成功
    if (!checkDbConfig()) {
      return NextResponse.json({ success: true })
    }

    const connected = await checkConnection()
    if (!connected) {
      return NextResponse.json({ success: true })
    }

    const searchParams = request.nextUrl.searchParams
    const versionId = searchParams.get('id')

    if (!versionId) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      )
    }

    await query('DELETE FROM version_history WHERE id = $1', [parseInt(versionId)])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Version delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete version', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
