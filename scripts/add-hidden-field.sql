-- 为 wechat_articles 表添加 hidden 字段
-- 用于在前台隐藏文章而不删除

-- 添加 hidden 字段（默认为 false）
ALTER TABLE wechat_articles 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- 添加索引以加速查询
CREATE INDEX IF NOT EXISTS idx_wechat_articles_hidden 
ON wechat_articles(hidden);

-- 添加组合索引（category + hidden）用于栏目筛选
CREATE INDEX IF NOT EXISTS idx_wechat_articles_category_hidden 
ON wechat_articles(category, hidden);

-- 验证更改
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'wechat_articles' 
AND column_name = 'hidden';

