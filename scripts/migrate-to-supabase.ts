#!/usr/bin/env tsx
/**
 * 迁移本地 JSON 数据到 Supabase
 * 使用方法: pnpm tsx scripts/migrate-to-supabase.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { supabase } from '../lib/supabase'

async function migrate() {
  console.log('🚀 开始迁移数据到 Supabase...\n')

  try {
    // 1. 读取本地 JSON 文件
    console.log('📖 读取本地数据文件...')
    const contentPath = join(process.cwd(), 'public/data/content.json')
    const teamPath = join(process.cwd(), 'public/data/team.json')

    const contentData = JSON.parse(readFileSync(contentPath, 'utf-8'))
    const teamData = JSON.parse(readFileSync(teamPath, 'utf-8'))

    console.log('✓ Content 数据读取成功')
    console.log('  - Portfolio items:', contentData.portfolio?.items?.length || 0)
    console.log('  - Projects:', contentData.projects?.list?.length || 0)
    console.log('  - Research:', contentData.research?.list?.length || 0)
    console.log('✓ Team 数据读取成功')
    console.log('  - 团队成员:', teamData.length || 0)

    // 2. 检查数据库连接
    console.log('\n🔗 测试 Supabase 连接...')
    const { data: testData, error: testError } = await supabase
      .from('content')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Supabase 连接失败:', testError.message)
      console.log('\n请确保：')
      console.log('1. Supabase 数据库已启动')
      console.log('2. 已运行 init-supabase.sql 创建表')
      console.log('3. .env.local 中的 SUPABASE_URL 和 ANON_KEY 正确')
      return
    }
    console.log('✓ Supabase 连接成功')

    // 3. 上传 Content 数据
    console.log('\n📤 上传 Content 数据...')
    
    // 删除旧数据
    const { error: deleteContentError } = await supabase
      .from('content')
      .delete()
      .neq('id', 0) // 删除所有行

    if (deleteContentError) {
      console.warn('⚠️  删除旧 content 数据失败:', deleteContentError.message)
    }

    // 插入新数据
    const { data: newContent, error: contentError } = await supabase
      .from('content')
      .insert({
        data: contentData,
        version: 1,
      })
      .select()

    if (contentError) {
      console.error('❌ Content 数据上传失败:', contentError.message)
      return
    }
    console.log('✓ Content 数据上传成功')

    // 4. 上传 Team 数据
    console.log('\n📤 上传 Team 数据...')
    
    // 删除旧数据
    const { error: deleteTeamError } = await supabase
      .from('team')
      .delete()
      .neq('id', 0) // 删除所有行

    if (deleteTeamError) {
      console.warn('⚠️  删除旧 team 数据失败:', deleteTeamError.message)
    }

    // 插入新数据
    const { data: newTeam, error: teamError } = await supabase
      .from('team')
      .insert({
        data: teamData,
        version: 1,
      })
      .select()

    if (teamError) {
      console.error('❌ Team 数据上传失败:', teamError.message)
      return
    }
    console.log('✓ Team 数据上传成功')

    // 5. 创建初始版本历史
    console.log('\n📝 创建初始版本历史...')
    
    const { error: versionError } = await supabase
      .from('version_history')
      .insert([
        {
          data_type: 'content',
          data: contentData,
          version: 1,
          description: '初始迁移',
        },
        {
          data_type: 'team',
          data: teamData,
          version: 1,
          description: '初始迁移',
        },
      ])

    if (versionError) {
      console.warn('⚠️  版本历史创建失败:', versionError.message)
    } else {
      console.log('✓ 版本历史创建成功')
    }

    // 6. 验证数据
    console.log('\n🔍 验证迁移结果...')
    
    const { data: verifyContent, error: verifyContentError } = await supabase
      .from('content')
      .select('*')
      .single()

    const { data: verifyTeam, error: verifyTeamError } = await supabase
      .from('team')
      .select('*')
      .single()

    if (verifyContentError || verifyTeamError) {
      console.error('❌ 验证失败')
      return
    }

    console.log('✓ Content 记录:', verifyContent?.id)
    console.log('✓ Team 记录:', verifyTeam?.id)

    console.log('\n' + '='.repeat(50))
    console.log('✅ 数据迁移完成！')
    console.log('='.repeat(50))
    console.log('\n下一步：')
    console.log('1. 访问 http://localhost:3000/admin 测试管理后台')
    console.log('2. 在 Vercel 环境变量中添加 Supabase 配置')
    console.log('3. 重新部署应用')

  } catch (error) {
    console.error('\n❌ 迁移失败:', error)
    if (error instanceof Error) {
      console.error('错误详情:', error.message)
      console.error('堆栈:', error.stack)
    }
  }
}

migrate()


