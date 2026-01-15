/**
 * 微信文章管理 API - 后台管理专用
 * 
 * 提供微信文章的 CRUD 操作
 */

import { NextResponse } from "next/server";
import { query, queryOne, checkConnection } from "@/lib/db";
import { CATEGORY_ALIASES } from "@/lib/wechat-categories";

// 获取分类及其别名（用于数据库查询）
function getCategoryWithAliases(category: string): string[] {
  const categories = [category];
  for (const [oldName, newName] of Object.entries(CATEGORY_ALIASES)) {
    if (newName === category) {
      categories.push(oldName);
    }
  }
  return categories;
}

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

export async function GET(request: Request) {
  try {
    // 验证权限
    const { valid } = await validateRequest(request);
    if (!valid) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json(
        { error: "数据库连接失败" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const id = searchParams.get("id");

    // 获取单篇文章
    if (id) {
      const data = await queryOne("SELECT * FROM wechat_articles WHERE id = $1", [id]);

      if (!data) {
        return NextResponse.json(
          { error: "文章不存在" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    // 构建查询
    let sql = "SELECT * FROM wechat_articles WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    // 分类筛选（兼容旧分类名）
    if (category) {
      const categoryList = getCategoryWithAliases(category);
      if (categoryList.length === 1) {
        sql += ` AND category = $${paramIndex++}`;
        params.push(category);
      } else {
        const placeholders = categoryList.map((_, i) => `$${paramIndex + i}`).join(', ');
        sql += ` AND category IN (${placeholders})`;
        params.push(...categoryList);
        paramIndex += categoryList.length;
      }
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

    // 排序和分页
    sql += " ORDER BY publish_time DESC";
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const data = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < count,
      },
    });
  } catch (error) {
    console.error("获取微信文章失败:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "获取文章失败",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // 验证权限
    const { valid, body } = await validateRequest(request);
    if (!valid) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json(
        { error: "数据库连接失败" },
        { status: 500 }
      );
    }

    const { id, title, description, content, coverImage, category, hidden } = body || {};

    if (!id) {
      return NextResponse.json(
        { error: "缺少文章 ID" },
        { status: 400 }
      );
    }

    // 构建更新
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
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      params.push(content);
    }
    if (coverImage !== undefined) {
      updates.push(`cover_image = $${paramIndex++}`);
      params.push(coverImage);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (hidden !== undefined) {
      updates.push(`hidden = $${paramIndex++}`);
      params.push(hidden);
    }

    params.push(id);
    const sql = `UPDATE wechat_articles SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "文章更新成功",
    });
  } catch (error) {
    console.error("更新微信文章失败:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "更新文章失败",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // 验证权限
    const { valid, body } = await validateRequest(request);
    if (!valid) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const connected = await checkConnection();
    if (!connected) {
      return NextResponse.json(
        { error: "数据库连接失败" },
        { status: 500 }
      );
    }

    const { id } = body || {};

    if (!id) {
      return NextResponse.json(
        { error: "缺少文章 ID" },
        { status: 400 }
      );
    }

    await query("DELETE FROM wechat_articles WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "文章删除成功",
    });
  } catch (error) {
    console.error("删除微信文章失败:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "删除文章失败",
      },
      { status: 500 }
    );
  }
}
