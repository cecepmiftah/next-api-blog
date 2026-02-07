import Post from "@/models/Post";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// export async function GET() {
//   await connectDB();
//   try {
//     const posts = await Post.find({}).sort({ createdAt: -1 });
//     return NextResponse.json(posts);
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 },
//     );
//   }
// }

// POST create new post

// GET all posts (with filtering)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (authorId) {
      query.authorId = authorId;
    }

    if (category) {
      query.category = category;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 },
      );
    }

    await connectDB();

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingSlug = await Post.findOne({ slug: data.slug });
    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug already exists. Please use a different one.",
        },
        { status: 400 },
      );
    }

    // Create new post with author info from session
    const postData = {
      ...data,
      authorId: session.user.id || session.user.email,
      authorName: session.user.name || "Anonymous",
      authorEmail: session.user.email || "unknown@example.com",
    };

    const post = await Post.create(postData);

    return NextResponse.json({
      success: true,
      data: post,
      message:
        data.status === "published"
          ? "Post published successfully!"
          : "Draft saved successfully!",
    });
  } catch (error) {
    console.error("Create post error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug already exists. Please use a different one.",
        },
        { status: 400 },
      );
    }

    // Handle validation errors
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

// PATCH untuk update post (digunakan untuk auto-save)
export async function PATCH(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 },
      );
    }

    await connectDB();

    const data = await request.json();
    const { postId, ...updateData } = data;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required for update" },
        { status: 400 },
      );
    }

    // Find post by ID
    const post = await Post.findById(postId);

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
    Object.assign(post, updateData);
    post.updatedAt = new Date();
    post.autoSaved = true; // Flag untuk menandai auto-save

    await post.save();

    return NextResponse.json({
      success: true,
      data: post,
      message: "Auto-saved successfully",
    });
  } catch (error) {
    console.error("Auto-save error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
