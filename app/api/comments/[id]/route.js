import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

// GET single comment
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const comment = await Comment.findById(id).lean();

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 },
      );
    }

    // Check authorization to view comment
    const session = await auth();
    const post = await Post.findById(comment.postId).select("status authorId");

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    const canView =
      post.status === "published" ||
      (session &&
        (post.authorId === session.user.id ||
          comment.authorId === session.user.id ||
          session.user.role === "admin"));

    if (!canView) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to view this comment",
        },
        { status: 403 },
      );
    }

    // Format response
    const responseData = {
      ...comment,
      _id: comment._id.toString(),
      likeCount: comment.likes ? comment.likes.length : 0,
      hasLiked: session
        ? comment.likes?.some((like) => like.userId === session.user.id)
        : false,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("GET /api/comments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH update comment
export async function PATCH(request, { params }) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 },
      );
    }

    // Check authorization
    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to edit this comment",
        },
        { status: 403 },
      );
    }

    // Only allow content update for authors
    if (data.content !== undefined) {
      if (!data.content.trim()) {
        return NextResponse.json(
          { success: false, error: "Comment content cannot be empty" },
          { status: 400 },
        );
      }

      // Save edit history
      if (!comment.editHistory) {
        comment.editHistory = [];
      }

      comment.editHistory.push({
        content: comment.content,
        editedAt: new Date(),
      });

      comment.content = data.content.trim();
      comment.edited = true;
      comment.updatedAt = new Date();
    }

    // Admin can update status
    if (isAdmin && data.status !== undefined) {
      comment.status = data.status;
    }

    await comment.save();

    // Format response
    const responseData = {
      ...comment.toObject(),
      _id: comment._id.toString(),
      likeCount: comment.likes.length,
      hasLiked: comment.likes.some((like) => like.userId === session.user.id),
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/comments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE comment
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { id } = await params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 },
      );
    }

    // Check authorization
    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";
    const post = await Post.findById(comment.postId);
    const isPostAuthor = post && post.authorId === session.user.id;

    if (!isAuthor && !isAdmin && !isPostAuthor) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to delete this comment",
        },
        { status: 403 },
      );
    }

    // Soft delete for author, hard delete for admin/post author
    if (isAuthor) {
      comment.status = "deleted";
      comment.content = "[This comment has been deleted by the author]";
      await comment.save();
    } else {
      // Delete comment and its replies
      await Comment.deleteMany({
        $or: [{ _id: id }, { parentId: id }],
      });

      // Update post comment count
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { comments: -1 },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/comments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
