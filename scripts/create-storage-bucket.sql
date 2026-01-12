-- 创建 Supabase Storage 存储桶
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建 media 存储桶（公开访问）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,  -- 公开访问
  5242880,  -- 5MB 限制
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. 设置存储策略：允许匿名用户读取
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

-- 3. 设置存储策略：允许认证用户上传（使用 service_role key 时自动通过）
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'media');

-- 4. 设置存储策略：允许认证用户删除
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'media');

-- 注意：如果策略已存在会报错，可以忽略
-- 或者先删除旧策略再创建：
-- DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
