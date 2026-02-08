// app/api/posts/check-slug/route.js
import { NextResponse } from "next/server";
import Post from "@/models/Post";
import connectDB from "@/lib/mongoose";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const excludeId = searchParams.get("excludeId");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 },
      );
    }

    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingPost = await Post.findOne(query);

    return NextResponse.json({
      success: true,
      data: {
        available: !existingPost,
        slug,
        exists: !!existingPost,
      },
    });
  } catch (error) {
    console.error("Check slug error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
