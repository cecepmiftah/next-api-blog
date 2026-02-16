import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, bio, image } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { success: false, error: "Name must be less than 50 characters" },
        { status: 400 },
      );
    }

    if (bio && bio.length > 200) {
      return NextResponse.json(
        { success: false, error: "Bio must be less than 200 characters" },
        { status: 400 },
      );
    }

    await connectDB();

    // Update user in database
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: name.trim(),
          bio: bio?.trim() || "",
          image: image || "",
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        image: updatedUser.image,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
