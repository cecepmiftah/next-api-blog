import { FaFileAlt, FaPlus } from "react-icons/fa";
import Link from "next/link";

const PostsEmpty = ({ filters }) => {
  const getMessage = () => {
    if (filters.search) {
      return `No posts found for "${filters.search}"`;
    }
    if (filters.status === "draft") {
      return "No draft posts found";
    }
    if (filters.status === "private") {
      return "No private posts found";
    }
    if (filters.status === "my") {
      return "You haven't created any posts yet";
    }
    if (filters.category !== "all") {
      return `No posts found in ${filters.category} category`;
    }
    return "No posts found";
  };

  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
        <FaFileAlt className="text-4xl text-slate-600" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">{getMessage()}</h3>

      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        {filters.search
          ? "Try adjusting your search terms or clear filters"
          : "Be the first to create amazing content!"}
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium"
        >
          Refresh Page
        </button>

        <Link
          href="/posts/create"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium"
        >
          <FaPlus />
          <span>Create Your First Post</span>
        </Link>
      </div>
    </div>
  );
};

export default PostsEmpty;
