import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    // Check file size (Cloudinary Free Tier limit: 10MB for images, 100MB for videos)
    const maxSize = 10 * 1024 * 1024; // 10MB for images

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Check file size
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "File type not allowed",
        },
        { status: 400 },
      );
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file);

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Upload failed" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
