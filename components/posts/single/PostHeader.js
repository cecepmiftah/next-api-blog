import {
  FaCalendar,
  FaUser,
  FaEye,
  FaTag,
  FaEdit,
  FaTrash,
  FaGlobe,
  FaLock,
  FaFileAlt,
} from "react-icons/fa";
import Link from "next/link";

const PostHeader = ({ post, isAuthor, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <FaGlobe className="text-sm" />,
        label: "Published",
      },
      draft: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <FaFileAlt className="text-sm" />,
        label: "Draft",
      },
      private: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <FaLock className="text-sm" />,
        label: "Private",
      },
    };

    return badges[status] || badges.draft;
  };

  const statusBadge = getStatusBadge(post.status);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          {/* Category & Status */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link
              href={`/posts?category=${post.category}`}
              className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {post.category}
            </Link>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${statusBadge.color}`}
            >
              {statusBadge.icon}
              {statusBadge.label}
            </span>

            {/* Author Actions */}
            {isAuthor && (
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full text-sm flex items-center gap-2"
                >
                  <FaEdit size={12} />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-full text-sm flex items-center gap-2"
                >
                  <FaTrash size={12} />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-400" />
              <Link
                href={`/profile/${post.authorId}`}
                className="hover:text-white transition-colors"
              >
                {post.authorName}
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <FaCalendar className="text-green-400" />
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              <FaEye className="text-purple-400" />
              <span>{post.views || 0} views</span>
            </div>

            {post.updatedAt !== post.createdAt && (
              <div className="text-sm text-slate-500">
                Updated: {formatDate(post.updatedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Reading Stats */}
        <div className="lg:w-64 bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Reading Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Reading Time</div>
              <div className="text-2xl font-bold text-white">
                {Math.ceil((post.content?.blocks?.length || 0) / 5)} min
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-1">Word Count</div>
              <div className="text-2xl font-bold text-white">
                {JSON.stringify(post.content).split(" ").length} words
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-400 mb-1">Blocks</div>
              <div className="text-2xl font-bold text-white">
                {post.content?.blocks?.length || 0} blocks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
