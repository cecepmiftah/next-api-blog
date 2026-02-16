"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MdClose,
  MdUpload,
  MdSave,
  MdPerson,
  MdEmail,
  MdDescription,
  MdWarning,
  MdCheckCircle,
  MdError,
  MdInfo,
} from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { debounce } from "lodash";

export default function EditProfileModal({ user, isOpen, onClose }) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        image: user.image || "",
      });
      setPreviewImage(user.image || "");
    }
  }, [user]);

  // Debounced validation
  const validateField = useCallback(
    debounce((name, value) => {
      const newErrors = { ...errors };

      switch (name) {
        case "name":
          if (!value || value.trim().length === 0) {
            newErrors.name = "Name is required";
          } else if (value.length > 50) {
            newErrors.name = "Name must be less than 50 characters";
          } else {
            delete newErrors.name;
          }
          break;

        case "bio":
          if (value && value.length > 200) {
            newErrors.bio = "Bio must be less than 200 characters";
          } else {
            delete newErrors.bio;
          }
          break;

        default:
          break;
      }

      setErrors(newErrors);
    }, 500),
    [errors],
  );

  if (!isOpen) return null;

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setUploadError(null);
    setUploadProgress(0);

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      const error = "Only JPG, PNG, GIF, and WebP images are allowed";
      setUploadError(error);
      toast.error(error);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      const error = "Image size must be less than 5MB";
      setUploadError(error);
      toast.error(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Upload to Cloudinary
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profile"); // Specify profile type

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          image: result.data.url,
        }));
        toast.success("Image uploaded successfully!");

        // Reset progress after success
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        setUploadError(result.error || "Failed to upload image");
        toast.error(result.error || "Failed to upload image");
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadError("Failed to upload image");
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = async () => {
    setShowDeleteConfirm(false);

    // Reset preview and form data
    setPreviewImage("");
    setFormData((prev) => ({ ...prev, image: "" }));

    toast.success("Image removed");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before submit
    if (errors.name || errors.bio) {
      toast.error("Please fix the errors before saving");
      return;
    }

    if (!formData.name || formData.name.trim().length === 0) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Update session
        await updateSession({
          ...session,
          user: {
            ...session.user,
            name: formData.name,
            image: formData.image,
          },
        });

        toast.success("Profile updated successfully!");
        router.refresh();

        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field
    validateField(name, value);
  };

  // Get modal width based on screen size
  const getModalWidth = () => {
    if (isMobile) return "w-full";
    if (isTablet) return "w-4/5 max-w-lg";
    return "w-full max-w-md";
  };

  return (
    <>
      <Toaster
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
            fontSize: isMobile ? "14px" : "16px",
          },
        }}
      />

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className={`bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl ${getModalWidth()} relative animate-modal-slide-up max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 bg-slate-800/90 backdrop-blur-lg p-4 sm:p-6 border-b border-slate-700/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Edit Profile
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                aria-label="Close"
              >
                <MdClose className="text-xl sm:text-2xl" />
              </button>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Update your profile information
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Profile Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Profile Picture
              </label>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Image Preview */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`${isMobile ? "w-28 h-28" : "w-32 h-32"} rounded-full overflow-hidden border-4 border-slate-700 shadow-xl`}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <MdPerson
                          className={`${isMobile ? "text-5xl" : "text-6xl"} text-slate-400`}
                        />
                      </div>
                    )}
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center rounded-full">
                      <FaSpinner className="text-2xl sm:text-3xl text-blue-400 animate-spin mb-2" />
                      <span className="text-xs text-white">
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="cursor-pointer flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <div
                        className={`w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 text-sm sm:text-base ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <MdUpload className="text-lg" />
                        {isUploading
                          ? `Uploading... ${uploadProgress}%`
                          : "Change Photo"}
                      </div>
                    </label>

                    {previewImage && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-300 text-sm sm:text-base"
                        disabled={isUploading}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 text-center sm:text-left">
                    JPG, PNG, GIF, WebP (Max 5MB)
                  </p>

                  {uploadError && (
                    <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                      <MdError className="flex-shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <MdPerson className="text-lg" />
                  <span>Full Name</span>
                  <span className="text-red-400">*</span>
                </div>
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full bg-slate-900/50 border ${
                    errors.name ? "border-red-500" : "border-slate-700"
                  } rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    errors.name ? "focus:ring-red-500" : "focus:ring-blue-500"
                  } focus:border-transparent transition-all text-sm sm:text-base`}
                  placeholder="Enter your name"
                  maxLength="50"
                  disabled={isSaving}
                />

                {errors.name && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    <MdWarning className="text-lg" />
                  </div>
                )}
              </div>

              {errors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <MdError />
                  {errors.name}
                </p>
              )}

              <div className="flex justify-end">
                <span className="text-xs text-slate-500">
                  {formData.name.length}/50
                </span>
              </div>
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <MdEmail className="text-lg" />
                  <span>Email Address</span>
                </div>
              </label>

              <input
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="w-full bg-slate-900/30 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed text-sm sm:text-base"
              />

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MdInfo />
                Email cannot be changed
              </p>
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <MdDescription className="text-lg" />
                  <span>Bio</span>
                </div>
              </label>

              <div className="relative">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={isMobile ? "3" : "4"}
                  maxLength="200"
                  className={`w-full bg-slate-900/50 border ${
                    errors.bio ? "border-red-500" : "border-slate-700"
                  } rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    errors.bio ? "focus:ring-red-500" : "focus:ring-blue-500"
                  } focus:border-transparent transition-all resize-none text-sm sm:text-base`}
                  placeholder="Tell us about yourself..."
                  disabled={isSaving}
                />

                {errors.bio && (
                  <div className="absolute right-3 top-3 text-red-500">
                    <MdWarning className="text-lg" />
                  </div>
                )}
              </div>

              {errors.bio && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <MdError />
                  {errors.bio}
                </p>
              )}

              <div className="flex justify-between text-xs text-slate-500">
                <span>Optional</span>
                <span
                  className={formData.bio.length > 180 ? "text-yellow-400" : ""}
                >
                  {formData.bio.length}/200
                </span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-slate-800/90 backdrop-blur-lg pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 text-sm sm:text-base order-2 sm:order-1"
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSaving || isUploading || Object.keys(errors).length > 0
                }
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span className="truncate">Saving...</span>
                  </>
                ) : (
                  <>
                    <MdSave className="text-lg" />
                    <span className="truncate">Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Remove Profile Picture?</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to remove your profile picture? This action
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveImage}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
