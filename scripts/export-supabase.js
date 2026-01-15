/**
 * 从 Supabase 导出数据
 * 运行: node scripts/export-supabase.js
 */

const fs = require('fs');

const SUPABASE_URL = 'https://mzkfjhzcvxxoyggjufbf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a2ZqaHpjdnh4b3lnZ2p1ZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTY2MTYsImV4cCI6MjA4MDA5MjYxNn0.UK9mcU0WDQX34LH-DboC1GWAKrE6MCb0aDlXC9BLVn4';

async function fetchTable(tableName) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  
  if (!response.ok) {
    console.error(`Failed to fetch ${tableName}:`, response.status);
    return [];
  }
  
  return response.json();
}

async function main() {
  console.log('开始从 Supabase 导出数据...\n');
  
  const tables = ['content', 'team', 'version_history', 'wechat_articles', 'videos'];
  const exportData = {};
  
  for (const table of tables) {
    console.log(`导出 ${table}...`);
    const data = await fetchTable(table);
    exportData[table] = data;
    console.log(`  - ${data.length} 条记录`);
  }
  
  // 保存到文件
  const outputPath = './scripts/supabase-export.json';
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`\n✅ 数据已导出到 ${outputPath}`);
  
  // 生成 SQL 导入语句
  let sql = '';
  
  // Content
  if (exportData.content.length > 0) {
    const c = exportData.content[0];
    sql += `-- Content\nDELETE FROM content;\nINSERT INTO content (id, data, version, created_at, updated_at) VALUES (${c.id}, '${JSON.stringify(c.data).replace(/'/g, "''")}', ${c.version}, '${c.created_at}', '${c.updated_at}');\n\n`;
  }
  
  // Team
  if (exportData.team.length > 0) {
    const t = exportData.team[0];
    sql += `-- Team\nDELETE FROM team;\nINSERT INTO team (id, data, version, created_at, updated_at) VALUES (${t.id}, '${JSON.stringify(t.data).replace(/'/g, "''")}', ${t.version}, '${t.created_at}', '${t.updated_at}');\n\n`;
  }
  
  // Wechat Articles
  if (exportData.wechat_articles.length > 0) {
    sql += `-- Wechat Articles\nDELETE FROM wechat_articles;\n`;
    for (const a of exportData.wechat_articles) {
      const title = (a.title || '').replace(/'/g, "''");
      const desc = (a.description || '').replace(/'/g, "''");
      const content = (a.content || '').replace(/'/g, "''");
      const url = (a.url || '').replace(/'/g, "''");
      const cover = (a.cover_image || '').replace(/'/g, "''");
      const mpName = (a.mp_name || '').replace(/'/g, "''");
      const category = (a.category || '').replace(/'/g, "''");
      
      sql += `INSERT INTO wechat_articles (id, title, description, content, url, cover_image, publish_time, publish_date, mp_name, category) VALUES ('${a.id}', '${title}', '${desc}', '${content}', '${url}', '${cover}', ${a.publish_time || 'NULL'}, '${a.publish_date || ''}', '${mpName}', '${category}');\n`;
    }
    sql += '\n';
  }
  
  // Videos
  if (exportData.videos.length > 0) {
    sql += `-- Videos\nDELETE FROM videos;\n`;
    for (const v of exportData.videos) {
      const title = (v.title || '').replace(/'/g, "''");
      const desc = (v.description || '').replace(/'/g, "''");
      const tags = JSON.stringify(v.tags || []).replace(/'/g, "''");
      const cover = (v.cover_image || '').replace(/'/g, "''");
      
      sql += `INSERT INTO videos (id, title, description, bvid, category, tags, cover_image, sort_order, hidden) VALUES ('${v.id}', '${title}', '${desc}', '${v.bvid}', '${v.category || ''}', '${tags}'::text[], '${cover}', ${v.sort_order || 0}, ${v.hidden || false});\n`;
    }
  }
  
  const sqlPath = './scripts/import-data.sql';
  fs.writeFileSync(sqlPath, sql);
  console.log(`✅ SQL 导入脚本已生成: ${sqlPath}`);
}

main().catch(console.error);
