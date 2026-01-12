-- 为 videos 表添加缺失的字段
-- 在 Supabase SQL Editor 中执行此脚本

-- 添加封面图字段
ALTER TABLE videos ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 添加排序字段
ALTER TABLE videos ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_sort_order ON videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_videos_hidden ON videos(hidden);

-- 添加注释
COMMENT ON COLUMN videos.cover_image IS '自定义封面图URL，为空则使用B站封面';
COMMENT ON COLUMN videos.sort_order IS '排序顺序，数字越小越靠前';

-- 查看表结构
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'videos' 
ORDER BY ordinal_position;
