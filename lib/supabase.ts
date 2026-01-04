import { createClient } from '@supabase/supabase-js'

// 使用默认值避免构建时报错
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 检查环境变量是否正确配置
export function checkSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase 环境变量未配置，请检查 .env.local 文件')
    return false
  }
  return true
}

// 数据类型定义
export interface ContentData {
  id?: number
  data: any
  version: number
  created_at?: string
  updated_at?: string
}

export interface TeamData {
  id?: number
  data: any[]
  version: number
  created_at?: string
  updated_at?: string
}

export interface VersionHistory {
  id?: number
  data_type: 'content' | 'team'
  data: any
  version: number
  description?: string
  created_at?: string
}

