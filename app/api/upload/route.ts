/**
 * 图片上传 API - 使用 Supabase Storage
 * 
 * 支持上传图片到 Supabase Storage 并返回公开 URL
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 验证密码
async function verifyPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD || "jinqiu2025";
  return password === correctPassword;
}

// 允许的图片类型
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "未配置 Supabase" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const password = formData.get("password") as string | null;
    const folder = (formData.get("folder") as string) || "covers"; // 默认存储到 covers 文件夹

    // 验证密码
    if (!password || !(await verifyPassword(password))) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 验证文件
    if (!file) {
      return NextResponse.json({ error: "请选择要上传的文件" }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，请上传 JPG、PNG、WebP 或 GIF 图片" },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "文件太大，最大支持 5MB" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${folder}/${timestamp}_${randomStr}.${ext}`;

    // 转换文件为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from("media") // bucket 名称
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "31536000", // 缓存一年
        upsert: false,
      });

    if (error) {
      console.error("上传失败:", error);
      
      // 如果是 bucket 不存在的错误，给出提示
      if (error.message?.includes("bucket") || error.message?.includes("not found")) {
        return NextResponse.json(
          { 
            error: "存储桶不存在，请先在 Supabase 控制台创建名为 'media' 的存储桶",
            details: error.message 
          },
          { status: 500 }
        );
      }
      
      throw error;
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: data.path,
        size: file.size,
        type: file.type,
      },
      message: "上传成功",
    });
  } catch (error) {
    console.error("上传失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传失败" },
      { status: 500 }
    );
  }
}
