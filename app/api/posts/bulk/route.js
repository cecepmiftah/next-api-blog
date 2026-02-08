import { NextResponse } from "next/server";
import Post from "@/models/Post";
import connectDB from "@/lib/mongoose";
import { auth } from "@/auth";

// POST bulk delete posts
export async function POST(request) {
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

    const { ids, action } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No posts selected" },
        { status: 400 },
      );
    }

    // Get posts untuk cek authorization
    const posts = await Post.find({ _id: { $in: ids } });

    // Cek jika user adalah author semua posts
    const unauthorizedPosts = posts.filter(
      (post) =>
        post.authorId !== session.user.id &&
        post.authorEmail !== session.user.email,
    );

    if (unauthorizedPosts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to modify some posts",
        },
        { status: 403 },
      );
    }

    let result;
    let message;

    switch (action) {
      case "delete":
        result = await Post.deleteMany({ _id: { $in: ids } });
        message = `${result.deletedCount} posts deleted successfully`;
        break;

      case "publish":
        result = await Post.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "published", updatedAt: new Date() } },
        );
        message = `${result.modifiedCount} posts published successfully`;
        break;

      case "draft":
        result = await Post.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "draft", updatedAt: new Date() } },
        );
        message = `${result.modifiedCount} posts moved to draft`;
        break;

      case "private":
        result = await Post.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "private", updatedAt: new Date() } },
        );
        message = `${result.modifiedCount} posts set to private`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("POST /api/posts/bulk error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// GET post statistics
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "all"; // all, week, month, year

    let dateFilter = {};
    const now = new Date();

    switch (timeframe) {
      case "week":
        dateFilter.createdAt = {
          $gte: new Date(now.setDate(now.getDate() - 7)),
        };
        break;
      case "month":
        dateFilter.createdAt = {
          $gte: new Date(now.setMonth(now.getMonth() - 1)),
        };
        break;
      case "year":
        dateFilter.createdAt = {
          $gte: new Date(now.setFullYear(now.getFullYear() - 1)),
        };
        break;
    }

    // Get user's posts statistics
    const userStats = await Post.aggregate([
      {
        $match: {
          $or: [
            { authorId: session.user.id },
            { authorEmail: session.user.email },
          ],
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          totalComments: { $sum: "$comments" },
        },
      },
    ]);

    // Get overall statistics (only published posts)
    const overallStats = await Post.aggregate([
      {
        $match: {
          status: "published",
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          totalComments: { $sum: "$comments" },
          avgViews: { $avg: "$views" },
        },
      },
    ]);

    // Format response
    const stats = {
      user: {
        published: 0,
        draft: 0,
        private: 0,
        total: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
      },
      overall: overallStats[0] || {
        totalPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgViews: 0,
      },
    };

    // Fill user stats
    userStats.forEach((stat) => {
      stats.user[stat._id] = stat.count;
      stats.user.total += stat.count;
      stats.user.totalViews += stat.totalViews;
      stats.user.totalLikes += stat.totalLikes;
      stats.user.totalComments += stat.totalComments;
    });

    return NextResponse.json({
      success: true,
      data: stats,
      timeframe,
    });
  } catch (error) {
    console.error("GET /api/posts/bulk error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
