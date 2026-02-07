"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  FaSave,
  FaPaperPlane,
  FaImage,
  FaTag,
  FaCalendar,
  FaEye,
  FaLock,
  FaGlobe,
  FaTimes,
  FaSpinner,
  FaHistory,
  FaUpload,
  FaDownload,
} from "react-icons/fa";
import { MdDescription, MdTitle } from "react-icons/md";
import { useSession } from "next-auth/react";
import { useAutoSave } from "@/lib/useAutoSave";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] bg-slate-900 rounded-xl border border-slate-700 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading Editor...</p>
      </div>
    </div>
  ),
});

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const [postData, setPostData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: {
      time: Date.now(),
      blocks: [],
      version: "2.26.5",
    },
    tags: [],
    status: "draft",
    category: "general",
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "technology", label: "Technology" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health" },
    { value: "entertainment", label: "Entertainment" },
  ];

  const statusOptions = [
    { value: "draft", label: "Draft", icon: FaEye, color: "text-yellow-400" },
    {
      value: "published",
      label: "Published",
      icon: FaGlobe,
      color: "text-green-400",
    },
    { value: "private", label: "Private", icon: FaLock, color: "text-red-400" },
  ];

  // Initialize auto-save hook
  const {
    autoSave,
    clearDraft,
    restoreDraft,
    trackChanges,
    debouncedAutoSave,
    lastSaved,
    isAutoSaving,
    hasUnsavedChanges,
    hasDraft,
  } = useAutoSave(session?.user?.id, postData);

  // Cek jika ada draft tersimpan saat page load
  useEffect(() => {
    if (status === "authenticated" && hasDraft) {
      setShowRestorePrompt(true);
    }
  }, [status, hasDraft]);

  // Restore draft dari localStorage
  const handleRestoreDraft = async () => {
    try {
      const restoredData = await restoreDraft();
      if (restoredData) {
        setPostData(restoredData);
        setSuccess("Draft restored successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      setError("Failed to restore draft");
    } finally {
      setShowRestorePrompt(false);
    }
  };

  const handleDiscardDraft = async () => {
    await clearDraft();
    setShowRestorePrompt(false);
    setSuccess("Draft discarded");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Track changes untuk semua input
  const updatePostData = useCallback(
    (updates) => {
      setPostData((prev) => {
        const newData = { ...prev, ...updates };
        // Trigger change tracking
        setTimeout(() => trackChanges(), 0);
        // Trigger debounced auto-save
        setTimeout(() => debouncedAutoSave(), 0);
        return newData;
      });
    },
    [trackChanges, debouncedAutoSave],
  );

  // Event handlers dengan auto-save tracking
  const handleContentChange = (content) => {
    const excerpt = generateExcerpt(content);
    updatePostData({ content, excerpt });
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 60);
    updatePostData({ title, slug, metaTitle: title });
  };

  const handleSlugChange = (e) => {
    updatePostData({ slug: e.target.value });
  };

  const handleExcerptChange = (e) => {
    updatePostData({ excerpt: e.target.value });
  };

  const handleCategoryChange = (e) => {
    updatePostData({ category: e.target.value });
  };

  const handleStatusChange = (status) => {
    updatePostData({ status });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!postData.tags.includes(tagInput.trim())) {
        const newTags = [...postData.tags, tagInput.trim()];
        updatePostData({ tags: newTags });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = postData.tags.filter((tag) => tag !== tagToRemove);
    updatePostData({ tags: newTags });
  };

  // Save draft ke database (MongoDB)
  const saveDraftToDatabase = async () => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...postData,
          status: "draft",
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save draft");
      }

      return result;
    } catch (err) {
      throw err;
    }
  };

  const handleSaveDraft = async () => {
    if (!validatePost()) return;

    setIsSavingDraft(true);
    setError(null);

    try {
      // Save ke database
      const result = await saveDraftToDatabase();

      // Clear draft dari localStorage setelah berhasil save ke DB
      await clearDraft();

      setSuccess("Draft saved to database successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to save draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!validatePost()) return;

    if (!window.confirm("Are you sure you want to publish this post?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Publish ke database
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...postData,
          status: "published",
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to publish post");
      }

      // Clear draft dari localStorage setelah berhasil publish
      await clearDraft();

      setSuccess(`Post "${postData.title}" published successfully!`);

      setTimeout(() => {
        router.push("/posts");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to publish post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Manual save to localStorage (bisa dipanggil dari button)
  const handleManualSaveToLocalStorage = async () => {
    try {
      await autoSave();
      setSuccess("Auto-saved to browser storage!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      setError("Failed to auto-save");
    }
  };

  // Export draft sebagai backup
  const handleExportDraft = () => {
    const dataStr = JSON.stringify(postData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `draft-${new Date().getTime()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import draft
  const handleImportDraft = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        setPostData(importedData);
        setSuccess("Draft imported successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError("Invalid draft file");
      }
    };
    reader.readAsText(file);
  };

  // Generate slug from title
  useEffect(() => {
    if (postData.title) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 60);
      setPostData((prev) => ({ ...prev, slug }));
      setPostData((prev) => ({ ...prev, metaTitle: prev.title }));
    }
  }, [postData.title]);

  // Generate excerpt from first 150 characters of content
  const generateExcerpt = (content) => {
    if (!content || !content.blocks) return "";

    const textBlocks = content.blocks
      .filter((block) => block.type === "paragraph")
      .map((block) => block.data.text)
      .join(" ")
      .replace(/<[^>]*>/g, "")
      .substring(0, 150)
      .trim();

    return textBlocks + (textBlocks.length >= 150 ? "..." : "");
  };

  const handleFeaturedImageUpload = async (e) => {
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
      setError("Only image files are allowed (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPostData((prev) => ({ ...prev, featuredImage: result.data.url }));
        setSuccess("Featured image uploaded successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFeaturedImage = () => {
    setPostData((prev) => ({ ...prev, featuredImage: "" }));
  };

  const validatePost = () => {
    if (!postData.title.trim()) {
      setError("Title is required");
      return false;
    }

    if (!postData.slug.trim()) {
      setError("Slug is required");
      return false;
    }

    if (postData.content.blocks.length === 0) {
      setError("Content is required");
      return false;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9\-]+$/;
    if (!slugRegex.test(postData.slug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens");
      return false;
    }

    return true;
  };

  // Save post to MongoDB
  const savePostToDB = async (status) => {
    try {
      const postToSave = {
        ...postData,
        status,
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postToSave),
        credentials: "include", // Include cookies for authentication
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save post");
      }

      return result;
    } catch (err) {
      throw err;
    }
  };

  const handleMetaTitleChange = (e) => {
    setPostData((prev) => ({ ...prev, metaTitle: e.target.value }));
  };

  const handleMetaDescriptionChange = (e) => {
    setPostData((prev) => ({ ...prev, metaDescription: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Restore Draft Prompt */}
        {showRestorePrompt && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg">💾</span>
                </div>
                <div>
                  <p className="font-medium">Unsaved draft found!</p>
                  <p className="text-sm">Last saved: {lastSaved}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
                >
                  Restore Draft
                </button>
                <button
                  onClick={handleDiscardDraft}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header dengan Auto-save Status */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create New Post
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                {/* Auto-save Status */}
                <div className="flex items-center gap-2">
                  {isAutoSaving ? (
                    <>
                      <FaSpinner className="animate-spin text-blue-400" />
                      <span>Auto-saving...</span>
                    </>
                  ) : (
                    <>
                      <FaHistory className="text-green-400" />
                      <span>Last auto-save: {lastSaved}</span>
                    </>
                  )}
                </div>

                {/* Unsaved Changes Indicator */}
                {hasUnsavedChanges && !isAutoSaving && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span>Unsaved changes</span>
                  </div>
                )}

                {/* Manual Save Button */}
                <button
                  onClick={handleManualSaveToLocalStorage}
                  disabled={isAutoSaving}
                  className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 disabled:opacity-50"
                >
                  <FaSave className="text-xs" />
                  Save to Browser
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Export/Import Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportDraft}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <FaDownload className="text-xs" />
                  Export
                </button>
                <label className="cursor-pointer">
                  <div className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium flex items-center gap-2">
                    <FaUpload className="text-xs" />
                    Import
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportDraft}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isLoading}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingDraft ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Draft
                  </>
                )}
              </button>

              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Publish Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-shake">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-lg">!</span>
                </div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <p>{success}</p>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdTitle className="text-2xl text-blue-400" />
                <h2 className="text-xl font-bold">Post Title</h2>
              </div>

              <input
                type="text"
                value={postData.title}
                onChange={handleTitleChange}
                placeholder="Enter post title here..."
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white text-2xl font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={postData.slug}
                    onChange={handleSlugChange}
                    placeholder="post-url-slug"
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-2">
                    Category
                  </label>
                  <select
                    value={postData.category}
                    onChange={handleCategoryChange}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Editor Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <MdDescription className="text-2xl text-purple-400" />
                  <h2 className="text-xl font-bold">Content</h2>
                </div>
                <p className="text-slate-400 text-sm mt-1">
                  Write your post content using the rich text editor below
                </p>
              </div>

              <div className="p-1">
                <EditorComponent
                  data={postData.content}
                  onChange={handleContentChange}
                  holder="create-post-editor"
                />
              </div>
            </div>

            {/* Excerpt Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold mb-4">Excerpt</h3>
              <p className="text-slate-400 text-sm mb-4">
                A short summary of your post. This will be displayed in post
                listings.
              </p>
              <textarea
                value={postData.excerpt}
                onChange={handleExcerptChange}
                placeholder="Write a brief excerpt for your post..."
                rows={3}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Publish Status */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaCalendar className="text-blue-400" />
                Publish Status
              </h3>

              <div className="space-y-3">
                {statusOptions.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => handleStatusChange(value)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                      postData.status === value
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`text-lg ${color}`} />
                      <div className="text-left">
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-slate-400">
                          {value === "draft" && "Save as draft"}
                          {value === "published" && "Publish immediately"}
                          {value === "private" && "Only visible to you"}
                        </div>
                      </div>
                    </div>
                    {postData.status === value && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Auto-save</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaImage className="text-green-400" />
                Featured Image
              </h3>

              {postData.featuredImage ? (
                <div className="relative group">
                  <img
                    src={postData.featuredImage}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <button
                    onClick={removeFeaturedImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-slate-600 transition-colors">
                  <div className="text-4xl mb-4 text-slate-500">🖼️</div>
                  <p className="text-slate-400 mb-4">Upload a featured image</p>

                  <label className="cursor-pointer">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity inline-block">
                      Select Image
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                  </label>

                  {isLoading && (
                    <div className="mt-4">
                      <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-4">
                Recommended size: 1200x630px • Max size: 5MB
              </p>
            </div>

            {/* Tags */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaTag className="text-yellow-400" />
                Tags
              </h3>

              <div className="mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a tag and press Enter"
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Press Enter to add a tag
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {postData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-slate-900 border border-slate-700 rounded-full px-3 py-1 flex items-center gap-2"
                  >
                    <span className="text-sm">{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-red-400 text-xs"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                {postData.tags.length === 0 && (
                  <p className="text-slate-500 text-sm italic">
                    No tags added yet
                  </p>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold mb-4">SEO Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={postData.metaTitle}
                    onChange={handleMetaTitleChange}
                    placeholder="SEO title for search engines"
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {postData.metaTitle?.length || 0}/70 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={postData.metaDescription}
                    onChange={handleMetaDescriptionChange}
                    placeholder="SEO description for search results"
                    rows={3}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {postData.metaDescription?.length || 0}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Action Bar */}
        <div className="mt-8 pt-8 border-t border-slate-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      postData.status === "draft"
                        ? "bg-yellow-500"
                        : postData.status === "published"
                          ? "bg-green-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <span>
                    Status:{" "}
                    {postData.status.charAt(0).toUpperCase() +
                      postData.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Blocks: {postData.content.blocks.length}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDraft ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save as Draft
                  </>
                )}
              </button>

              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-slate-500 text-sm">
          <p>
            All uploaded files are stored securely in Cloudinary • Auto-save
            every 30 seconds
          </p>
        </footer>
      </div>
    </div>
  );
}
