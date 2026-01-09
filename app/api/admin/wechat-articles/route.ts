/**
 * 微信文章管理 API - 后台管理专用
 * 
 * 提供微信文章的 CRUD 操作
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

// Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 验证密码
async function verifyPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD || "jinqiu2025";
  return password === correctPassword;
}

// 验证请求
async function validateRequest(request: Request): Promise<boolean> {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    if (password) {
      return await verifyPassword(password);
    }

    const body = await request.json().catch(() => ({}));
    if (body.password) {
      return await verifyPassword(body.password);
    }

    return false;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // 验证权限
    const isValid = await validateRequest(request);
    if (!isValid) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "未配置 Supabase" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const id = searchParams.get("id");

    // 获取单篇文章
    if (id) {
      const { data, error } = await supabase
        .from("wechat_articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
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

    // 获取文章列表
    let query = supabase
      .from("wechat_articles")
      .select("*", { count: "exact" });

    // 分类筛选（先筛选，兼容旧分类名）
    if (category) {
      const categoryList = getCategoryWithAliases(category);
      if (categoryList.length === 1) {
        query = query.eq("category", category);
      } else {
        query = query.in("category", categoryList);
      }
    }

    // 搜索（在筛选结果中搜索）
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order("publish_time", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
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
    const isValid = await validateRequest(request);
    if (!isValid) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "未配置 Supabase" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, title, description, content, coverImage, category, hidden } = body;

    if (!id) {
      return NextResponse.json(
        { error: "缺少文章 ID" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 构建更新对象（只更新提供的字段）
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.cover_image = coverImage;
    if (category !== undefined) updateData.category = category;
    if (hidden !== undefined) updateData.hidden = hidden;

    // 更新文章
    const { data, error } = await supabase
      .from("wechat_articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
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
    const isValid = await validateRequest(request);
    if (!isValid) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "未配置 Supabase" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "缺少文章 ID" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 删除文章
    const { error } = await supabase
      .from("wechat_articles")
      .delete()
      .eq("id", id);

    if (error) throw error;

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
