import { NextRequest, NextResponse } from 'next/server'
import { supabase, checkSupabaseConfig } from '@/lib/supabase'

// GET: 获取版本历史
export async function GET(request: NextRequest) {
  try {
    // 如果 Supabase 未配置，返回空列表
    if (!checkSupabaseConfig()) {
      return NextResponse.json({ versions: [] })
    }
    const searchParams = request.nextUrl.searchParams
    const dataType = searchParams.get('type') // 'content' 或 'team'
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('version_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (dataType && (dataType === 'content' || dataType === 'team')) {
      query = query.eq('data_type', dataType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch version history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch version history', details: error.message },
        { status: 500 }
      )
    }

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
    // 如果 Supabase 未配置，返回成功
    if (!checkSupabaseConfig()) {
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

    const { error } = await supabase
      .from('version_history')
      .delete()
      .eq('id', parseInt(versionId))

    if (error) {
      console.error('Failed to delete version:', error)
      return NextResponse.json(
        { error: 'Failed to delete version', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Version delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete version', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

