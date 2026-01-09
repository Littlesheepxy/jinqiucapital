-- 将旧分类 jinqiu-scan 迁移到新分类 jinqiu-lab
-- 在 Supabase SQL Editor 中执行

-- 1. 查看当前分类分布
SELECT category, COUNT(*) as count 
FROM wechat_articles 
GROUP BY category 
ORDER BY count DESC;

-- 2. 更新旧分类名称
UPDATE wechat_articles 
SET category = 'jinqiu-lab' 
WHERE category = 'jinqiu-scan';

-- 3. 验证更新结果
SELECT category, COUNT(*) as count 
FROM wechat_articles 
GROUP BY category 
ORDER BY count DESC;

