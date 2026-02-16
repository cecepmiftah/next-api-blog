import { NextResponse } from "next/server";
import Post from "@/models/Post";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

// GET single post by ID atau slug
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    // Cari post by ID atau slug
    const post = await Post.findOne({
      $or: [{ slug: slug }],
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Cek authorization untuk non-published posts
    const session = await auth();
    const canView =
      post.status === "published" ||
      (session &&
        (post.authorId === session.user.id ||
          post.authorEmail === session.user.email));

    if (!canView) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to view this post" },
        { status: 403 },
      );
    }

    // Increment views jika post published
    if (post.status === "published") {
      post.views += 1;
      await post.save();
    }

    // Format response
    const responseData = {
      ...post.toObject(),
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
