/**
 * 视频公开 API - 前台展示用
 * 
 * 获取视频列表（只返回未隐藏的视频）
 * 自动从 B站 API 获取封面图
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 从B站API获取视频封面图
// 参考文档: https://github.com/socialsisteryi/bilibili-api-collect/blob/master/docs/video/info.md
async function getBilibiliCover(bvid: string): Promise<string | null> {
  try {
    // 使用简单的视频信息接口
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Origin': 'https://www.bilibili.com',
      },
      // 设置超时
      signal: AbortSignal.timeout(5000),
    });
    
    const data = await response.json();
    console.log(`B站API响应 (${bvid}):`, JSON.stringify({ code: data.code, message: data.message }));
    
    // 根据文档，封面图在 data.pic 字段
    if (data.code === 0 && data.data?.pic) {
      // 确保使用 https
      let picUrl = data.data.pic;
      if (picUrl.startsWith('http://')) {
        picUrl = picUrl.replace('http://', 'https://');
      }
      return picUrl;
    }
    return null;
  } catch (error) {
    console.error(`获取B站封面失败 (${bvid}):`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "未配置 Supabase" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("videos")
      .select("id, title, description, bvid, category, tags, cover_image, sort_order, created_at", { count: "exact" })
      .eq("hidden", false);

    // 分类筛选
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error, count } = await query
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // 为没有封面图的视频获取B站封面
    const videosWithCovers = await Promise.all(
      (data || []).map(async (video) => {
        let coverImage = video.cover_image;
        
        // 如果没有封面图，从B站获取
        if (!coverImage && video.bvid) {
          coverImage = await getBilibiliCover(video.bvid);
          
          // 可选：将获取到的封面图保存到数据库（缓存）
          if (coverImage) {
            await supabase
              .from("videos")
              .update({ cover_image: coverImage })
              .eq("id", video.id);
          }
        }
        
        return {
          id: video.id,
          title: video.title,
          description: video.description,
          bvid: video.bvid,
          category: video.category,
          tags: video.tags,
          coverImage: coverImage,
          sortOrder: video.sort_order,
          createdAt: video.created_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        videos: videosWithCovers,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: offset + limit < (count || 0),
        },
      },
    });
  } catch (error) {
    console.error("获取视频失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取视频失败" },
      { status: 500 }
    );
  }
}
