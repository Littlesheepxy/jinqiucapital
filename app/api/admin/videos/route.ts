/**
 * 视频管理 API - 后台管理专用
 * 
 * 提供视频的 CRUD 操作
 */

import { NextResponse } from "next/server";
import { query, queryOne, checkConnection } from "@/lib/db";

// 验证密码
async function verifyPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD || "jinqiu2025";
  return password === correctPassword;
}

// 验证请求
async function validateRequest(request: Request): Promise<{ valid: boolean; body?: any }> {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    if (password) {
      return { valid: await verifyPassword(password) };
    }

    const body = await request.json().catch(() => ({}));
    if (body.password) {
      return { valid: await verifyPassword(body.password), body };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// 从 B站链接提取 BV 号
function extractBvid(url: string): string | null {
  if (!url) return null;
  
  // 已经是 BV 号
  if (/^BV[\w]+$/.test(url)) return url;
  
  const patterns = [
    /bilibili\.com\/video\/(BV[\w]+)/i,
    /b23\.tv\/(BV[\w]+)/i,
    /bvid=(BV[\w]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// GET - 获取视频列表
export async function GET(request: Request) {
  try {
    const { valid } = await validateRequest(request);
    if (!valid) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json({ error: "数据库连接失败" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const includeHidden = searchParams.get("includeHidden") === "true";
    const id = searchParams.get("id");

    // 获取单个视频
    if (id) {
      const data = await queryOne("SELECT * FROM videos WHERE id = $1", [id]);

      if (!data) {
        return NextResponse.json({ error: "视频不存在" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data });
    }

    // 构建查询
    let sql = "SELECT * FROM videos WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    // 分类筛选
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    // 隐藏状态筛选
    if (!includeHidden) {
      sql += " AND hidden = false";
    }

    // 搜索
    if (search) {
      sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 获取总数
    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as count");
    const countResult = await query<{ count: string }>(countSql, params);
    const count = parseInt(countResult[0]?.count || "0");

    // 排序
    sql += " ORDER BY sort_order ASC, created_at DESC";

    const data = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count,
    });
  } catch (error) {
    console.error("获取视频失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取视频失败" },
      { status: 500 }
    );
  }
}

// POST - 添加视频
export async function POST(request: Request) {
  try {
    const { valid, body } = await validateRequest(request);
    if (!valid) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json({ error: "数据库连接失败" }, { status: 500 });
    }

    const { title, bilibiliUrl, category, tags, description, coverImage } = body || {};

    if (!title || !bilibiliUrl) {
      return NextResponse.json(
        { error: "标题和 B站链接为必填项" },
        { status: 400 }
      );
    }

    // 提取 BV 号
    const bvid = extractBvid(bilibiliUrl);
    if (!bvid) {
      return NextResponse.json(
        { error: "无法识别 B站视频链接，请检查格式" },
        { status: 400 }
      );
    }

    // 检查是否已存在相同 BV 号的视频
    const existing = await queryOne("SELECT id FROM videos WHERE bvid = $1", [bvid]);

    if (existing) {
      return NextResponse.json(
        { error: "该视频已存在" },
        { status: 400 }
      );
    }

    // 获取当前最大排序值
    const maxSortData = await queryOne<{ sort_order: number }>(
      "SELECT sort_order FROM videos ORDER BY sort_order DESC LIMIT 1"
    );

    const sortOrder = (maxSortData?.sort_order || 0) + 1;

    // 生成唯一 ID
    const id = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 插入视频
    const result = await query(
      `INSERT INTO videos (id, title, bvid, category, tags, description, cover_image, sort_order, hidden)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, title, bvid, category || null, tags || [], description || "", coverImage || null, sortOrder, false]
    );

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "视频添加成功",
    });
  } catch (error) {
    console.error("添加视频失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "添加视频失败" },
      { status: 500 }
    );
  }
}

// PUT - 更新视频
export async function PUT(request: Request) {
  try {
    const { valid, body } = await validateRequest(request);
    if (!valid) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json({ error: "数据库连接失败" }, { status: 500 });
    }

    const { id, title, bilibiliUrl, category, tags, description, coverImage, hidden, sortOrder } = body || {};

    if (!id) {
      return NextResponse.json({ error: "缺少视频 ID" }, { status: 400 });
    }

    // 构建更新对象
    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(tags);
    }
    if (coverImage !== undefined) {
      updates.push(`cover_image = $${paramIndex++}`);
      params.push(coverImage);
    }
    if (hidden !== undefined) {
      updates.push(`hidden = $${paramIndex++}`);
      params.push(hidden);
    }
    if (sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      params.push(sortOrder);
    }

    // 如果更新了 B站链接，需要重新提取 BV 号
    if (bilibiliUrl !== undefined) {
      const bvid = extractBvid(bilibiliUrl);
      if (!bvid) {
        return NextResponse.json(
          { error: "无法识别 B站视频链接" },
          { status: 400 }
        );
      }
      updates.push(`bvid = $${paramIndex++}`);
      params.push(bvid);
    }

    params.push(id);
    const sql = `UPDATE videos SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "视频更新成功",
    });
  } catch (error) {
    console.error("更新视频失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新视频失败" },
      { status: 500 }
    );
  }
}

// DELETE - 删除视频
export async function DELETE(request: Request) {
  try {
    const { valid, body } = await validateRequest(request);
    if (!valid) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json({ error: "数据库连接失败" }, { status: 500 });
    }

    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: "缺少视频 ID" }, { status: 400 });
    }

    await query("DELETE FROM videos WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "视频删除成功",
    });
  } catch (error) {
    console.error("删除视频失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除视频失败" },
      { status: 500 }
    );
  }
}
