import { useState } from "react";
import { FaTag, FaTimes, FaHashtag } from "react-icons/fa";

const UpdatePostForm = ({
  post,
  onFieldChange,
  onContentChange,
  onTagUpdate,
  EditorComponent,
}) => {
  const [tagInput, setTagInput] = useState("");

  const categories = [
    { value: "general", label: "General" },
    { value: "technology", label: "Technology" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health" },
    { value: "entertainment", label: "Entertainment" },
  ];

  const handleTitleChange = (e) => {
    const title = e.target.value;
    onFieldChange("title", title);

    // Auto-generate slug if not manually edited
    if (!post.slugManuallyEdited) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 60);
      onFieldChange("slug", slug);
    }
  };

  const handleSlugChange = (e) => {
    onFieldChange("slug", e.target.value);
    onFieldChange("slugManuallyEdited", true);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!post.tags.includes(tagInput.trim())) {
        onTagUpdate([...post.tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      onTagUpdate([...post.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    onTagUpdate(post.tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-8">
      {/* Title & Slug Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Post Title
            </label>
            <input
              type="text"
              value={post.title || ""}
              onChange={handleTitleChange}
              placeholder="Enter post title..."
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white text-2xl font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={post.slug || ""}
                onChange={handleSlugChange}
                placeholder="post-url-slug"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-2">
                Used for the post URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={post.category || "general"}
                onChange={(e) => onFieldChange("category", e.target.value)}
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
      </div>

      {/* Editor Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-xl font-bold">Content</h3>
          <p className="text-slate-400 text-sm mt-1">
            Edit your post content using the rich text editor
          </p>
        </div>

        <div className="p-1">
          <EditorComponent
            data={post.content}
            onChange={onContentChange}
            holder="update-post-editor"
          />
        </div>
      </div>

      {/* Excerpt Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4">Excerpt</h3>
        <p className="text-slate-400 text-sm mb-4">
          A short summary of your post. This will be displayed in post listings.
        </p>
        <textarea
          value={post.excerpt || ""}
          onChange={(e) => onFieldChange("excerpt", e.target.value)}
          placeholder="Write a brief excerpt for your post..."
          rows={3}
          className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Tags Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaTag className="text-yellow-400" />
          Tags
        </h3>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter"
              className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleTagAdd}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter or click Add to add a tag
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag) => (
              <div
                key={tag}
                className="bg-slate-900 border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2 group"
              >
                <FaHashtag className="text-blue-400" />
                <span className="text-sm">{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="text-slate-400 hover:text-red-400 text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes />
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm italic">
              No tags added yet. Add tags to help readers find your post.
            </p>
          )}
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-xl font-bold mb-6">SEO Settings</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={post.metaTitle || post.title || ""}
              onChange={(e) => onFieldChange("metaTitle", e.target.value)}
              placeholder="SEO title for search engines"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between text-xs mt-2">
              <span className="text-slate-500">
                Recommended: 50-60 characters
              </span>
              <span
                className={`${
                  (post.metaTitle || post.title || "").length > 60
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {(post.metaTitle || post.title || "").length}/60
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meta Description
            </label>
            <textarea
              value={post.metaDescription || post.excerpt || ""}
              onChange={(e) => onFieldChange("metaDescription", e.target.value)}
              placeholder="SEO description for search results"
              rows={3}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between text-xs mt-2">
              <span className="text-slate-500">
                Recommended: 150-160 characters
              </span>
              <span
                className={`${
                  (post.metaDescription || post.excerpt || "").length > 160
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {(post.metaDescription || post.excerpt || "").length}/160
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePostForm;
