import { NextResponse } from "next/server";
import Post from "@/models/Post";
import connectDB from "@/lib/mongoose";

// GET all categories dengan stats
export async function GET() {
  try {
    await connectDB();

    // Get categories dengan jumlah posts
    const categories = await Post.aggregate([
      {
        $match: {
          status: "published",
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          latestPost: { $max: "$createdAt" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Format response
    const formattedCategories = categories.map((cat) => ({
      name: cat._id,
      count: cat.count,
      totalViews: cat.totalViews,
      latestPost: cat.latestPost,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error("GET /api/posts/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create/update category (admin only)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user is admin (example logic)
    // const isAdmin = session.user.role === 'admin';
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const { name, description } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 },
      );
    }

    // Note: Untuk implementasi lengkap, buat Category model terpisah
    // Ini hanya contoh

    return NextResponse.json({
      success: true,
      message: "Category feature coming soon",
      data: { name, description },
    });
  } catch (error) {
    console.error("POST /api/posts/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
