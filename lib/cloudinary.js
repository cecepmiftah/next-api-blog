import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(file) {
  try {
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "editorjs",
      resource_type: "auto", // Auto-detect file type
      timeout: 60000, // 60 seconds timeout
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      },
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
}

export async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return { success: false };
  }
}

// Helper function to extract public_id from Cloudinary URL
export function getPublicIdFromUrl(url) {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^/.]+)/);
  return match ? match[1] : null;
}
