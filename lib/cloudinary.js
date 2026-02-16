import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload file to Cloudinary for EditorJS
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} - Result upload
 */
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

/**
 * Upload gambar profile ke Cloudinary (dengan optimasi khusus)
 * @param {File} file - File gambar yang akan diupload
 * @returns {Promise<Object>} - Result upload
 */
export async function uploadProfileImage(file) {
  try {
    // Validasi file
    if (!file) {
      throw new Error("No file provided");
    }

    // Check file size (5MB max for profile images)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Check file type (only images for profile)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Only JPG, PNG, GIF, and WebP images are allowed for profile pictures",
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary dengan optimasi untuk profile
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "profile-pictures",
      resource_type: "image",
      timeout: 60000,

      // Optimasi untuk profile picture
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" }, // Crop ke face jika ada
        { quality: "auto:good" }, // Auto quality
        { fetch_format: "auto" }, // Auto format (WebP jika support)
      ],

      // Metadata
      tags: ["profile", "avatar"],
      context: {
        alt: "Profile picture",
        type: "avatar",
      },
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
    console.error("Profile image upload error:", error);
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
}

/**
 * Hapus file dari Cloudinary
 * @param {string} publicId - Public ID file yang akan dihapus
 * @returns {Promise<Object>} - Result penghapusan
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Extract public ID dari Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID
 */
export function extractPublicId(url) {
  if (!url) return null;

  // Regex untuk extract public ID dari Cloudinary URL
  const regex = /\/v\d+\/(?:.*\/)?([^\.]+)/;
  const match = url.match(regex);

  return match ? match[1] : null;
}
