import { NextResponse } from "next/server";
import Post from "@/models/Post";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

// GET single post by ID atau slug
export async function GET(request, { params }) {
  console.log("HIT GET /api/posts/[id]");
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

// PATCH update post
export async function PATCH(request, { params }) {
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

    const { id } = await params;
    const data = await request.json();

    // Cari post
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Cek authorization
    const isAuthor =
      post.authorId === session.user.id ||
      post.authorEmail === session.user.email;

    if (!isAuthor) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to update this post" },
        { status: 403 },
      );
    }

    // Update hanya fields yang diizinkan
    const allowedUpdates = [
      "title",
      "slug",
      "excerpt",
      "content",
      "featuredImage",
      "tags",
      "category",
      "status",
      "metaTitle",
      "metaDescription",
    ];

    allowedUpdates.forEach((field) => {
      if (data[field] !== undefined) {
        post[field] =
          field === "tags" ? data[field] : data[field].toString().trim();
      }
    });

    // Update timestamp
    post.updatedAt = new Date();

    // Save changes
    await post.save();

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
      message: data.autoSave
        ? "Auto-saved successfully"
        : "Post updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/posts/[id] error:", error);

    // Handle duplicate slug
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

// DELETE post
export async function DELETE(request, { params }) {
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

    const { id } = await params;

    // Cari post
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    // Cek authorization
    const isAuthor =
      post.authorId === session.user.id ||
      post.authorEmail === session.user.email;

    if (!isAuthor) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this post" },
        { status: 403 },
      );
    }

    // Delete post
    await Post.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully!",
    });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
