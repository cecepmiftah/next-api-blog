import { NextResponse } from "next/server";
import Post from "@/models/Post";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

// Helper function untuk build query dari filters
const buildQuery = (params, user) => {
  const {
    status = "published",
    category = "all",
    sortBy = "newest",
    search = "",
    authorId,
    page = 1,
    limit = 12,
  } = params;

  // Base query
  const query = {};

  // Status filter
  if (status === "my" && user) {
    // Hanya post milik user
    query.$or = [{ authorId: user.id }, { authorEmail: user.email }];
  } else if (status !== "all") {
    query.status = status;
  }

  // Category filter
  if (category !== "all") {
    query.category = category;
  }

  // Search filter
  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { excerpt: searchRegex },
      { "content.blocks.text": { $regex: searchRegex } },
      { tags: { $in: [searchRegex] } },
    ];
  }

  // Author filter (untuk admin atau filter spesifik)
  if (authorId) {
    query.authorId = authorId;
  }

  return query;
};

// Helper function untuk build sort options
const buildSort = (sortBy) => {
  switch (sortBy) {
    case "oldest":
      return { createdAt: 1 };
    case "popular":
      return { views: -1 };
    case "title-asc":
      return { title: 1 };
    case "title-desc":
      return { title: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

// GET all posts dengan filtering dan pagination
export async function GET(request) {
  try {
    await connectDB();

    // Dapatkan user session untuk authorization
    const session = await auth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      status: searchParams.get("status") || "published",
      category: searchParams.get("category") || "all",
      sortBy: searchParams.get("sortBy") || "newest",
      search: searchParams.get("search") || "",
      authorId: searchParams.get("authorId"),
      page: parseInt(searchParams.get("page")) || 1,
      limit: parseInt(searchParams.get("limit")) || 12,
    };

    // Validasi status filter untuk non-authenticated users
    if (!session && params.status !== "published") {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required for this filter",
        },
        { status: 401 },
      );
    }

    // Validate and return ketika query draft harus milik user itu sendiri dan user harus login
    if (params.status === "draft") {
      // Find posts dengan query draft hanya milik user yang login
      const posts = await Post.find({
        status: "draft",
        $or: [
          { authorId: session.user.id },
          { authorEmail: session.user.email },
        ],
      })
        .select("-__v -content")
        .lean();

      const formattedPosts = posts.map((post) => ({
        ...post,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: formattedPosts,
      });
    }

    // Build query
    const query = buildQuery(params, session?.user);
    const sort = buildSort(params.sortBy);

    // Calculate pagination
    const skip = (params.page - 1) * params.limit;

    // Get total count untuk pagination
    const total = await Post.countDocuments(query);

    // Fetch posts dengan pagination
    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(params.limit)
      .select("-__v -content") // Exclude heavy fields untuk list view
      .lean(); // Convert ke plain object untuk performance

    // Format response data
    const formattedPosts = posts.map((post) => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
        hasNext: params.page < Math.ceil(total / params.limit),
        hasPrev: params.page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}

// POST create new post
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

    // Parse request body
    const data = await request.json();

    // Validasi required fields
    if (!data.title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }

    if (!data.content?.blocks || data.content.blocks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 },
      );
    }

    // Generate slug jika tidak disediakan
    let slug = data.slug?.trim();
    if (!slug) {
      slug = data.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 60);
    }

    // Cek jika slug sudah ada
    const existingSlug = await Post.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug already exists. Please use a different one.",
        },
        { status: 400 },
      );
    }

    // Generate excerpt jika tidak disediakan
    let excerpt = data.excerpt?.trim();
    if (!excerpt) {
      // Ambil dari content
      const textBlocks = data.content.blocks
        .filter((block) => block.type === "paragraph")
        .map((block) => block.data.text)
        .join(" ")
        .replace(/<[^>]*>/g, "")
        .substring(0, 150)
        .trim();

      excerpt = textBlocks + (textBlocks.length >= 150 ? "..." : "");
    }

    // Prepare post data
    const postData = {
      title: data.title.trim(),
      slug,
      excerpt,
      content: data.content,
      tags: data.tags || [],
      category: data.category || "general",
      status: data.status || "draft",
      featuredImage: data.featuredImage || "",
      metaTitle: data.metaTitle || data.title.trim(),
      metaDescription: data.metaDescription || excerpt,
      authorId: session.user.id || session.user.email,
      authorName: session.user.name || "Anonymous",
      authorEmail: session.user.email || "unknown@example.com",
      views: 0,
      likes: 0,
      comments: 0,
    };

    // Create new post
    const post = await Post.create(postData);

    // Format response
    const responseData = {
      ...post.toObject(),
      _id: post._id.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message:
          data.status === "published"
            ? "Post published successfully!"
            : "Draft saved successfully!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/posts error:", error);

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
