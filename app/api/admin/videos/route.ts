/**
 * 视频管理 API - 后台管理专用
 * 
 * 提供视频的 CRUD 操作
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "未配置 Supabase" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const includeHidden = searchParams.get("includeHidden") === "true";
    const id = searchParams.get("id");

    // 获取单个视频
    if (id) {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) {
        return NextResponse.json({ error: "视频不存在" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data });
    }

    // 获取视频列表
    let query = supabase
      .from("videos")
      .select("*", { count: "exact" });

    // 分类筛选
    if (category) {
      query = query.eq("category", category);
    }

    // 隐藏状态筛选
    if (!includeHidden) {
      query = query.eq("hidden", false);
    }

    // 搜索
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
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

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "未配置 Supabase" }, { status: 500 });
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

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 检查是否已存在相同 BV 号的视频
    const { data: existing } = await supabase
      .from("videos")
      .select("id")
      .eq("bvid", bvid)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "该视频已存在" },
        { status: 400 }
      );
    }

    // 获取当前最大排序值
    const { data: maxSortData } = await supabase
      .from("videos")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (maxSortData?.sort_order || 0) + 1;

    // 生成唯一 ID
    const id = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 插入视频
    const { data, error } = await supabase
      .from("videos")
      .insert({
        id,
        title,
        bvid,
        category: category || null,
        tags: tags || [],
        description: description || "",
        cover_image: coverImage || null,
        sort_order: sortOrder,
        hidden: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
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

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "未配置 Supabase" }, { status: 500 });
    }

    const { id, title, bilibiliUrl, category, tags, description, coverImage, hidden, sortOrder } = body || {};

    if (!id) {
      return NextResponse.json({ error: "缺少视频 ID" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 构建更新对象
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (coverImage !== undefined) updateData.cover_image = coverImage;
    if (hidden !== undefined) updateData.hidden = hidden;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;

    // 如果更新了 B站链接，需要重新提取 BV 号
    if (bilibiliUrl !== undefined) {
      const bvid = extractBvid(bilibiliUrl);
      if (!bvid) {
        return NextResponse.json(
          { error: "无法识别 B站视频链接" },
          { status: 400 }
        );
      }
      updateData.bvid = bvid;
    }

    const { data, error } = await supabase
      .from("videos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
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

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "未配置 Supabase" }, { status: 500 });
    }

    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: "缺少视频 ID" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) throw error;

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
