#!/usr/bin/env tsx
/**
 * 测试 Supabase 连接
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function test() {
  console.log('🔗 测试 Supabase 连接...\n')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey?.substring(0, 20) + '...\n')

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 测试简单查询
    const { data, error } = await supabase
      .from('content')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ 连接失败:', error.message)
      console.log('\n请确保：')
      console.log('1. Supabase 服务已启动')
      console.log('2. 数据库表已创建（运行 init-supabase.sql）')
      console.log('3. URL 和 Key 正确')
      return
    }

    console.log('✅ 连接成功!')
    console.log('查询结果:', data)
  } catch (error) {
    console.error('❌ 错误:', error)
  }
}

test()





