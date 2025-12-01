#!/usr/bin/env tsx
/**
 * 检查 Supabase 数据库状态
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function check() {
  console.log('📊 检查 Supabase 数据库状态...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 检查 content 表
  const { data: contentData, error: contentError } = await supabase
    .from('content')
    .select('*')
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (contentError) {
    console.log('❌ Content 表:', contentError.message)
  } else {
    console.log('✅ Content 表:')
    console.log('  - 版本:', contentData?.version)
    console.log('  - 更新时间:', contentData?.updated_at)
    console.log('  - Portfolio 项目:', contentData?.data?.portfolio?.items?.length || 0)
    console.log('  - Research 项目:', contentData?.data?.research?.list?.length || 0)
  }

  // 检查 team 表
  const { data: teamData, error: teamError } = await supabase
    .from('team')
    .select('*')
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (teamError) {
    console.log('\n❌ Team 表:', teamError.message)
  } else {
    console.log('\n✅ Team 表:')
    console.log('  - 版本:', teamData?.version)
    console.log('  - 更新时间:', teamData?.updated_at)
    console.log('  - 团队成员:', teamData?.data?.length || 0)
  }

  // 检查版本历史
  const { data: versionData, error: versionError } = await supabase
    .from('version_history')
    .select('id, data_type, version, description, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (versionError) {
    console.log('\n❌ 版本历史:', versionError.message)
  } else {
    console.log('\n✅ 版本历史:')
    console.log(`  - 总计: ${versionData?.length || 0} 条记录`)
    if (versionData && versionData.length > 0) {
      console.log('\n  最近的版本:')
      versionData.forEach((v, i) => {
        console.log(`    ${i + 1}. [${v.data_type}] v${v.version} - ${v.description} (${new Date(v.created_at).toLocaleString('zh-CN')})`)
      })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ 数据库检查完成！')
  console.log('='.repeat(60))
}

check()

