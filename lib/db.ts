/**
 * PostgreSQL 数据库连接
 */

import { Pool, PoolClient } from 'pg'

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'jinqiucapital',
  user: process.env.DB_USER || 'jinqiu',
  password: process.env.DB_PASSWORD || 'jinqiu@2026',
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// 创建连接池
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig)
    
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err)
    })
  }
  return pool
}

// 执行查询
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

// 执行单条查询
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

// 插入并返回
export async function insert<T = any>(table: string, data: Record<string, any>): Promise<T | null> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
  
  const text = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
  const rows = await query<T>(text, values)
  return rows[0] || null
}

// 更新
export async function update<T = any>(
  table: string, 
  data: Record<string, any>, 
  where: string, 
  whereParams: any[]
): Promise<T | null> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
  
  // 调整 where 参数的索引
  const adjustedWhere = where.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + keys.length}`)
  
  const text = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${adjustedWhere} RETURNING *`
  const rows = await query<T>(text, [...values, ...whereParams])
  return rows[0] || null
}

// 删除
export async function remove(table: string, where: string, params: any[]): Promise<boolean> {
  const text = `DELETE FROM ${table} WHERE ${where}`
  const pool = getPool()
  const result = await pool.query(text, params)
  return (result.rowCount || 0) > 0
}

// 事务支持
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// 检查数据库连接
export async function checkConnection(): Promise<boolean> {
  try {
    await query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
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

export interface WechatArticle {
  id: string
  title: string
  description?: string
  content?: string
  url?: string
  cover_image?: string
  publish_time?: number
  publish_date?: string
  mp_name?: string
  category?: string
  created_at?: string
  updated_at?: string
}

export interface Video {
  id: string
  title: string
  description?: string
  bvid: string
  category?: string
  tags: string[]
  cover_image?: string
  sort_order: number
  hidden: boolean
  created_at?: string
  updated_at?: string
}
