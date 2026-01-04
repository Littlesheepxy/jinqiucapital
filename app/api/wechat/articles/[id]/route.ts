/**
 * 微信公众号文章详情 API
 */

import { NextResponse } from "next/server";
import { getArticleDetail } from "@/lib/wemprss";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;

    if (!articleId) {
      return NextResponse.json({
        success: false,
        error: "文章 ID 不能为空",
      }, { status: 400 });
    }

    const article = await getArticleDetail(articleId);

    if (!article) {
      return NextResponse.json({
        success: false,
        error: "文章不存在",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        content: article.content,
        description: article.description,
        url: article.url,
        coverImage: article.pic_url,
        publishTime: article.publish_time,
        publishDate: formatDate(article.publish_time),
        mpName: article.mp_name,
      },
    });
  } catch (error) {
    console.error("获取文章详情失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "获取文章详情失败",
    }, { status: 500 });
  }
}

/**
 * 格式化日期
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

