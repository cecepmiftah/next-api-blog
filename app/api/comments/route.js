import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

// GET all comments for a post
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const parentId = searchParams.get("parentId");
    const status = searchParams.get("status") || "approved";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 },
      );
    }

    // Build query
    const query = { postId, status: { $in: ["approved", "pending"] } };

    // if (parentId) {
    //   query.parentId = parentId;
    // } else {
    //   query.parentId = null; // Only top-level comments
    // }

    // Check post exists and get status
    const post = await Post.findById(postId).select("status authorId");
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // For non-published posts, only show comments to author
    const session = await auth();
    const canViewAll =
      session &&
      (post.authorId === session.user.id || session.user.role === "admin");

    if (post.status !== "published" && !canViewAll) {
      return NextResponse.json(
        { success: false, error: "Comments not available for this post" },
        { status: 403 },
      );
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
        sortOption = { "likes.length": -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Get comments
    const comments = await Comment.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Comment.countDocuments(query);

    // Format response
    const formattedComments = comments.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      likeCount: comment.likes ? comment.likes.length : 0,
      hasLiked: session
        ? comment.likes?.some((like) => like.userId === session.user.id)
        : false,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/comments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new comment
export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to comment" },
        { status: 401 },
      );
    }

    await connectDB();

    const data = await request.json();
    const { postId, content, parentId } = data;

    // Validate required fields
    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 },
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment content is required" },
        { status: 400 },
      );
    }

    // Check post exists and is commentable
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    if (post.status !== "published") {
      const isAuthor = post.authorId === session.user.id;
      if (!isAuthor) {
        return NextResponse.json(
          { success: false, error: "Comments are not allowed on this post" },
          { status: 403 },
        );
      }
    }

    // Check parent comment if replying
    let depth = 0;
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: "Parent comment not found" },
          { status: 404 },
        );
      }

      if (parentComment.depth >= 5) {
        return NextResponse.json(
          { success: false, error: "Maximum reply depth reached" },
          { status: 400 },
        );
      }

      depth = parentComment.depth + 1;
    }

    // Check for spam (simple example)
    const spamWords = ["spam", "casino", "viagra", "http://", "https://"];
    const isSpam = spamWords.some((word) =>
      content.toLowerCase().includes(word),
    );

    // Create new comment
    const commentData = {
      postId,
      content: content.trim(),
      parentId: parentId || null,
      depth,
      authorId: session.user.id,
      authorName: session.user.name || "Anonymous",
      authorEmail: session.user.email,
      authorAvatar: session.user.image || "",
      status: isSpam ? "spam" : "approved",
      isAuthor: post.authorId === session.user.id,
    };

    const comment = await Comment.create(commentData);

    // Update post comment count
    await Post.findByIdAndUpdate(postId, {
      $inc: { comments: 1 },
    });

    // Format response
    const responseData = {
      ...comment.toObject(),
      _id: comment._id.toString(),
      likeCount: 0,
      hasLiked: false,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Comment posted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/comments error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
