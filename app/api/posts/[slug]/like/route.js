import { NextResponse } from "next/server";
import Post from "@/models/Post";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

// POST like/unlike a post
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 },
      );
    }

    await connectDB();

    const { id } = await params;
    const { action = "like" } = await request.json();

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Check if user can view the post
    if (post.status !== "published") {
      const isAuthor =
        post.authorId === session.user.id ||
        post.authorEmail === session.user.email;

      if (!isAuthor) {
        return NextResponse.json(
          { success: false, error: "You cannot interact with this post" },
          { status: 403 },
        );
      }
    }

    // In production, you might want to store likes in a separate collection
    // This is a simplified version
    if (action === "like") {
      post.likes += 1;
    } else if (action === "unlike" && post.likes > 0) {
      post.likes -= 1;
    }

    await post.save();

    return NextResponse.json({
      success: true,
      message: `Post ${action}d successfully`,
      data: { likes: post.likes },
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// GET check if user liked the post
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { id } = await params;

    // In production, query a separate likes collection
    // This is a simplified version using localStorage on client

    return NextResponse.json({
      success: true,
      data: { liked: false }, // Would be dynamic in production
    });
  } catch (error) {
    console.error("GET /api/posts/[id]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
