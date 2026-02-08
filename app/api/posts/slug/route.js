import { NextResponse } from "next/server";
import Post from "@/models/Post";
import connectDB from "@/lib/mongoose";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const post = await Post.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Increment views if post is published
    if (post.status === "published") {
      post.views += 1;
      await post.save();
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { slug } = await params;
    const data = await request.json();

    const post = await Post.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Check if user owns the post
    if (
      post.authorId !== session.user.id &&
      post.authorEmail !== session.user.email
    ) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to update this post" },
        { status: 403 },
      );
    }

    // Update post
    Object.assign(post, data);
    post.updatedAt = new Date();

    await post.save();

    return NextResponse.json({
      success: true,
      data: post,
      message: "Post updated successfully!",
    });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { slug } = await params;

    const post = await Post.findOne({ slug });

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Check if user owns the post
    if (
      post.authorId !== session.user.id &&
      post.authorEmail !== session.user.email
    ) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this post" },
        { status: 403 },
      );
    }

    await Post.deleteOne({ slug });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully!",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
