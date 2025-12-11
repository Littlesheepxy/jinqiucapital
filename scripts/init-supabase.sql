-- 创建内容表
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建团队表
CREATE TABLE IF NOT EXISTS team (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建版本历史表
CREATE TABLE IF NOT EXISTS version_history (
  id SERIAL PRIMARY KEY,
  data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('content', 'team')),
  data JSONB NOT NULL,
  version INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_content_version ON content(version DESC);
CREATE INDEX IF NOT EXISTS idx_team_version ON team(version DESC);
CREATE INDEX IF NOT EXISTS idx_version_history_type ON version_history(data_type, created_at DESC);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 content 表创建触发器
DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 team 表创建触发器
DROP TRIGGER IF EXISTS update_team_updated_at ON team;
CREATE TRIGGER update_team_updated_at
  BEFORE UPDATE ON team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入初始数据（如果表为空）
INSERT INTO content (data, version)
SELECT '{}'::jsonb, 1
WHERE NOT EXISTS (SELECT 1 FROM content);

INSERT INTO team (data, version)
SELECT '[]'::jsonb, 1
WHERE NOT EXISTS (SELECT 1 FROM team);

COMMENT ON TABLE content IS '网站内容数据表';
COMMENT ON TABLE team IS '团队成员数据表';
COMMENT ON TABLE version_history IS '版本历史记录表';


