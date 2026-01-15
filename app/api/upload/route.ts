/**
 * 图片上传 API - 使用本地文件系统
 * 
 * 支持上传图片到本地 public/uploads 目录
 */

import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// 验证密码
async function verifyPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD || "jinqiu2025";
  return password === correctPassword;
}

// 允许的图片类型
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 上传目录
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// 确保上传目录存在
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
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

    // 确保上传目录存在
    ensureUploadDir();
    const folderPath = path.join(UPLOAD_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${timestamp}_${randomStr}.${ext}`;
    const filePath = path.join(folderPath, fileName);

    // 转换文件为 Buffer 并保存
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // 生成公开 URL（相对路径）
    const publicUrl = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        path: `${folder}/${fileName}`,
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
