import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

export async function POST(request, { params }) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to like comments" },
        { status: 401 },
      );
    }

    await connectDB();

    const { id } = await params;
    const { action = "like" } = await request.json();

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 },
      );
    }

    // Check if user can interact with comment
    if (comment.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Cannot interact with this comment" },
        { status: 403 },
      );
    }

    let liked = false;
    let message = "";

    if (action === "like") {
      liked = comment.addLike(session.user.id);
      message = liked ? "Comment liked" : "Already liked";
    } else if (action === "unlike") {
      liked = !comment.removeLike(session.user.id);
      message = "Comment unliked";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 },
      );
    }

    await comment.save();

    return NextResponse.json({
      success: true,
      data: {
        likeCount: comment.likes.length,
        hasLiked: action === "like" ? true : false,
      },
      message,
    });
  } catch (error) {
    console.error("POST /api/comments/[id]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await auth();

    await connectDB();

    const { id } = await params;
    const comment = await Comment.findById(id).select("likes").lean();

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        likeCount: comment.likes ? comment.likes.length : 0,
        hasLiked: session
          ? comment.likes?.some((like) => like.userId === session.user.id)
          : false,
      },
    });
  } catch (error) {
    console.error("GET /api/comments/[id]/like error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
