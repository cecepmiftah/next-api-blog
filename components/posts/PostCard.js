import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaUser,
  FaTag,
  FaLock,
  FaGlobe,
  FaFileAlt,
  FaThumbsUp,
  FaComment,
  FaEllipsisV,
} from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";

const PostCard = ({
  post,
  onDelete,
  onStatusChange,
  currentUser,
  viewMode,
}) => {
  const [showActions, setShowActions] = useState(false);

  const isAuthor =
    currentUser &&
    (post.authorId === currentUser.id ||
      post.authorEmail === currentUser.email);

  const canEdit = isAuthor || (currentUser && currentUser.role === "admin");
  const canDelete = isAuthor || (currentUser && currentUser.role === "admin");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateText = (text, length) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <FaGlobe className="text-xs" />,
        label: "Published",
      },
      draft: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <FaFileAlt className="text-xs" />,
        label: "Draft",
      },
      private: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <FaLock className="text-xs" />,
        label: "Private",
      },
    };

    return badges[status] || badges.draft;
  };

  const statusBadge = getStatusBadge(post.status);

  if (viewMode === "list") {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="lg:w-48 lg:flex-shrink-0">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 ${statusBadge.color}`}
                >
                  {statusBadge.icon}
                  {statusBadge.label}
                </span>

                <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs">
                  {post.category}
                </span>

                <div className="flex-1" />

                {/* Actions Menu */}
                {canEdit && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <FaEllipsisV />
                    </button>

                    {showActions && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10 overflow-hidden">
                        <Link
                          href={`/edit-post/${post.slug}`}
                          className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          onClick={() => setShowActions(false)}
                        >
                          <FaEdit />
                          <span>Edit Post</span>
                        </Link>

                        {canDelete && (
                          <button
                            onClick={() => {
                              setShowActions(false);
                              onDelete(post._id, post.slug);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </button>
                        )}

                        {/* Status Change Options */}
                        {post.status !== "published" && (
                          <button
                            onClick={() => {
                              setShowActions(false);
                              onStatusChange(post._id, "published");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors"
                          >
                            <FaGlobe />
                            <span>Publish</span>
                          </button>
                        )}

                        {post.status !== "draft" && (
                          <button
                            onClick={() => {
                              setShowActions(false);
                              onStatusChange(post._id, "draft");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-colors"
                          >
                            <FaFileAlt />
                            <span>Move to Draft</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {post.title}
                </Link>
              </h3>

              <p className="text-slate-400 mb-4">
                {truncateText(post.excerpt || "No excerpt available", 200)}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-400" />
                  <span>{post.authorName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FaCalendar className="text-green-400" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FaTag className="text-purple-400" />
                    <div className="flex gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-900 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="px-2 py-1 bg-slate-900 rounded text-xs">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 ml-auto">
                  <div className="flex items-center gap-2">
                    <FaThumbsUp className="text-blue-400" />
                    <span>{post.likes || 0}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaComment className="text-green-400" />
                    <span>{post.comments || 0}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaEye className="text-purple-400" />
                    <span>{post.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors overflow-hidden group">
      {/* Featured Image */}
      <div className="relative h-48 overflow-hidden">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <FaFileAlt className="text-4xl text-slate-600" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 ${statusBadge.color}`}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </span>
        </div>

        {/* Actions Overlay */}
        {canEdit && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <Link
                href={`/edit-post/${post.slug}`}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg backdrop-blur-sm"
                title="Edit"
              >
                <FaEdit size={14} />
              </Link>

              {canDelete && (
                <button
                  onClick={() => onDelete(post._id)}
                  className="p-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg backdrop-blur-sm"
                  title="Delete"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs">
            {post.category}
          </span>

          <span className="text-xs text-slate-500 flex items-center gap-1">
            <FaCalendar />
            {formatDate(post.createdAt)}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-2 line-clamp-2">
          <Link
            href={`/posts/${post.slug}`}
            className="hover:text-blue-400 transition-colors"
          >
            {post.title}
          </Link>
        </h3>

        <p className="text-slate-400 text-sm mb-4 line-clamp-3">
          {post.excerpt || "No excerpt available"}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs text-white">
            {post.authorName?.charAt(0) || "A"}
          </div>
          <div className="text-sm">
            <p className="text-white">{post.authorName}</p>
            <p className="text-slate-500 text-xs">Author</p>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FaThumbsUp />
              <span>{post.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaComment />
              <span>{post.comments || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaEye />
              <span>{post.views || 0}</span>
            </div>
          </div>

          <Link
            href={`/posts/${post.slug}`}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
