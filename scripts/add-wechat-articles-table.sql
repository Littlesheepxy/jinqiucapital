-- 创建微信文章缓存表
-- 在 Supabase SQL Editor 中执行此脚本

CREATE TABLE IF NOT EXISTS wechat_articles (
  id TEXT PRIMARY KEY,  -- 文章 ID，来自 We-MP-RSS
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT,
  cover_image TEXT,
  publish_time INTEGER,  -- Unix 时间戳
  publish_date TEXT,     -- 格式化日期
  mp_name TEXT,          -- 公众号名称
  category TEXT,         -- 分类 slug
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wechat_articles_category ON wechat_articles(category);
CREATE INDEX IF NOT EXISTS idx_wechat_articles_publish_time ON wechat_articles(publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_wechat_articles_mp_name ON wechat_articles(mp_name);

-- 为 wechat_articles 表创建更新时间触发器
-- 注意：如果 update_updated_at_column 函数不存在，需要先创建
DROP TRIGGER IF EXISTS update_wechat_articles_updated_at ON wechat_articles;
CREATE TRIGGER update_wechat_articles_updated_at
  BEFORE UPDATE ON wechat_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE wechat_articles IS '微信公众号文章缓存表';

