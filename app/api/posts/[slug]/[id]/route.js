import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";

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

    // Dapatkan id dari params
    const { id } = await params;
    console.log("PATCH request for id:", id);

    // Parse request body
    const data = await request.json();
    console.log("PATCH data received:", {
      title: data.title,
      newSlug: data.slug,
      contentLength: data.content?.blocks?.length || 0,
      hasContent: !!data.content,
    });

    // Cari post berdasarkan id
    const post = await Post.findById(id);

    if (!post) {
      console.log("Post not found with id:", id);
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 },
      );
    }

    console.log("Found post:", {
      id: post._id,
      currentSlug: post.slug,
      title: post.title,
      contentBlocks: post.content?.blocks?.length || 0,
    });

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

    // Log sebelum update
    console.log("Before update:", {
      title: post.title,
      slug: post.slug,
      contentBlocks: post.content?.blocks?.length,
    });

    // Proses updates satu per satu dengan handling khusus
    const updatePromises = [];

    // 1. Handle title update (dan auto-slug jika perlu)
    if (data.title !== undefined && data.title !== post.title) {
      post.title = data.title.toString().trim();

      // Jika slug tidak diubah manual, generate dari title
      if (!data.slug || data.slug === post.slug) {
        const newSlug = data.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-")
          .substring(0, 60);

        // Cek jika slug baru sudah ada (kecuali untuk post ini sendiri)
        const existingWithSlug = await Post.findOne({
          slug: newSlug,
          _id: { $ne: post._id },
        });

        if (!existingWithSlug) {
          post.slug = newSlug;
          console.log("Auto-generated slug:", newSlug);
        }
      }
    }

    // 2. Handle slug manual update
    if (data.slug !== undefined && data.slug !== post.slug) {
      const newSlug = data.slug.toString().trim();

      // Cek jika slug baru sudah ada (kecuali untuk post ini sendiri)
      const existingWithSlug = await Post.findOne({
        slug: newSlug,
        _id: { $ne: post._id },
      });

      if (existingWithSlug) {
        return NextResponse.json(
          {
            success: false,
            error: "Slug already exists. Please use a different one.",
          },
          { status: 400 },
        );
      }

      post.slug = newSlug;
      console.log("Manual slug update:", newSlug);
    }

    // 3. Handle content update (PENTING: jangan overwrite jika undefined)
    if (data.content !== undefined) {
      if (data.content === null || data.content === "") {
        // Jika content dikirim sebagai null atau empty string, set ke default
        post.content = {
          time: Date.now(),
          blocks: [],
          version: "2.26.5",
        };
        console.log("Content set to empty");
      } else {
        // Pastikan content memiliki struktur yang benar
        if (typeof data.content === "object" && data.content !== null) {
          post.content = {
            time: data.content.time || Date.now(),
            blocks: Array.isArray(data.content.blocks)
              ? data.content.blocks
              : [],
            version: data.content.version || "2.26.5",
          };
          console.log(
            "Content updated with blocks:",
            data.content.blocks?.length || 0,
          );
        }
      }
    }

    // 4. Handle other fields
    const otherFields = [
      "excerpt",
      "featuredImage",
      "category",
      "status",
      "metaTitle",
      "metaDescription",
    ];
    otherFields.forEach((field) => {
      if (data[field] !== undefined) {
        post[field] = data[field]?.toString().trim() || "";
      }
    });

    // 5. Handle tags (array khusus)
    if (data.tags !== undefined) {
      if (Array.isArray(data.tags)) {
        post.tags = data.tags
          .map((tag) => tag.toString().trim())
          .filter((tag) => tag);
      } else {
        post.tags = [];
      }
    }

    // Update timestamp
    post.updatedAt = new Date();

    // Log setelah update
    console.log("After update:", {
      title: post.title,
      slug: post.slug,
      contentBlocks: post.content?.blocks?.length,
    });

    // Save changes dengan validation
    try {
      await post.save();
      console.log("Post saved successfully");
    } catch (saveError) {
      console.error("Save error:", saveError);
      throw saveError;
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
      message: data.autoSave
        ? "Auto-saved successfully"
        : "Post updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/posts/[slug] error:", error);

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
    console.log("DELETE request for id:", id);

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
