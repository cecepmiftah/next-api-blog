import {
  FaImage,
  FaEye,
  FaGlobe,
  FaLock,
  FaFileAlt,
  FaUpload,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { useState } from "react";

const UpdatePostSidebar = ({
  post,
  onFeaturedImageUpdate,
  onFieldChange,
  onSaveDraft,
  onPublish,
  onPreview,
  isSaving,
  isPublishing,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const statusOptions = [
    {
      value: "draft",
      label: "Draft",
      icon: FaFileAlt,
      color: "text-yellow-400",
      description: "Save as draft",
    },
    {
      value: "published",
      label: "Published",
      icon: FaGlobe,
      color: "text-green-400",
      description: "Publish immediately",
    },
    {
      value: "private",
      label: "Private",
      icon: FaLock,
      color: "text-red-400",
      description: "Only visible to you",
    },
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Only image files are allowed (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onFeaturedImageUpdate(result.data.url);
      } else {
        alert(result.error || "Failed to upload image");
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeFeaturedImage = () => {
    onFeaturedImageUpdate("");
  };

  return (
    <div className="space-y-8">
      {/* Status Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4">Post Status</h3>

        <div className="space-y-3">
          {statusOptions.map(
            ({ value, label, icon: Icon, color, description }) => (
              <button
                key={value}
                onClick={() => onFieldChange("status", value)}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                  post.status === value
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`text-lg ${color}`} />
                  <div className="text-left">
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-slate-400">{description}</div>
                  </div>
                </div>
                {post.status === value && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Featured Image Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaImage className="text-green-400" />
          Featured Image
        </h3>

        {post.featuredImage ? (
          <div className="relative group mb-4">
            <img
              src={post.featuredImage}
              alt="Featured"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={removeFeaturedImage}
              className="absolute top-2 right-2 w-8 h-8 bg-red-600/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-slate-600 transition-colors mb-4">
            <div className="text-4xl mb-4 text-slate-500">🖼️</div>
            <p className="text-slate-400 mb-4">Upload a featured image</p>

            <label className="cursor-pointer">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity inline-block">
                Select Image
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {uploadingImage && (
          <div className="text-center">
            <FaSpinner className="animate-spin text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Uploading...</p>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">
          Recommended size: 1200x630px • Max size: 5MB
        </p>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/30 p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>

        <div className="space-y-3">
          <button
            onClick={onPreview}
            className="w-full p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <FaEye />
            <span>Preview Post</span>
          </button>

          <button
            onClick={onSaveDraft}
            disabled={isSaving || isPublishing}
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaFileAlt />
                <span>Save as Draft</span>
              </>
            )}
          </button>

          <button
            onClick={onPublish}
            disabled={isPublishing || isSaving}
            className="w-full p-3 bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 text-white rounded-lg font-medium transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <FaGlobe />
                <span>
                  {post.status === "published" ? "Update" : "Publish"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Post Stats Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4">Post Stats</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Views</div>
              <div className="text-2xl font-bold text-white">
                {post.views || 0}
              </div>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Likes</div>
              <div className="text-2xl font-bold text-white">
                {post.likes || 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Comments</div>
              <div className="text-2xl font-bold text-white">
                {post.comments || 0}
              </div>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Blocks</div>
              <div className="text-2xl font-bold text-white">
                {post.content?.blocks?.length || 0}
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400 pt-4 border-t border-slate-700/50">
            <div className="flex justify-between mb-1">
              <span>Created</span>
              <span className="text-white">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span className="text-white">
                {new Date(post.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePostSidebar;
