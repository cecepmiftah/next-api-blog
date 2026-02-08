import { FaPlus, FaSync, FaThLarge, FaList } from "react-icons/fa";
import Link from "next/link";

const PostsHeader = ({
  totalPosts,
  viewMode,
  onViewModeChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            All Posts
          </h1>
          <p className="text-slate-400">
            Browse and manage your content
            {totalPosts > 0 && (
              <span className="ml-2 px-3 py-1 bg-slate-800 rounded-full text-sm">
                {totalPosts} posts
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
              aria-label="Grid view"
            >
              <FaThLarge size={18} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
              aria-label="List view"
            >
              <FaList size={18} />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Refresh posts"
          >
            <FaSync className={isLoading ? "animate-spin" : ""} size={18} />
          </button>

          {/* Create Post Button */}
          <Link
            href="/posts/create"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
          >
            <FaPlus />
            <span>Create Post</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostsHeader;
