"use client";

import { useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaReply,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaUser,
  FaEllipsisV,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const CommentItem = ({
  comment,
  onUpdate,
  onDelete,
  onReplyAdded,
  currentUser,
  isReply = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isAuthor = currentUser && comment.authorId === currentUser.id;
  const isPostAuthor = comment.isAuthor;
  const hasLiked = comment.hasLiked;

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/comments/${comment._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: hasLiked ? "unlike" : "like",
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        onUpdate({
          ...comment,
          likeCount: result.data.likeCount,
          hasLiked: result.data.hasLiked,
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        onUpdate(result.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        onDelete(comment._id);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: comment.postId,
          content: replyContent,
          parentId: comment._id,
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        onReplyAdded(comment._id, result.data);
        setIsReplying(false);
        setReplyContent("");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  return (
    <div className={`${isReply ? "pl-12" : ""}`}>
      <div
        className={`bg-slate-800/30 rounded-xl p-4 ${isReply ? "border-l-2 border-blue-500/50" : ""}`}
      >
        {/* Comment Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.authorAvatar ? (
              <img
                src={comment.authorAvatar}
                alt={comment.authorName}
                className="w-10 h-10 rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
            )}
          </div>

          {/* Comment Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white truncate">
                {comment.authorName}
              </h4>

              {isPostAuthor && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-xs text-blue-400">
                  Author
                </span>
              )}

              <span className="text-sm text-slate-400">
                {formatDate(comment.createdAt)}
              </span>

              {comment.edited && (
                <span className="text-xs text-slate-500" title="Edited">
                  (edited)
                </span>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {(isAuthor || currentUser?.role === "admin") && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              >
                <FaEllipsisV />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10">
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 text-left"
                      >
                        <FaEdit />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </>
                  )}

                  {currentUser?.role === "admin" && (
                    <div className="border-t border-slate-700 pt-2">
                      <button className="w-full px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700 text-left">
                        Mark as Spam
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="3"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <FaCheck />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-300 mb-4 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Comment Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking || !currentUser}
              className={`flex items-center gap-2 text-sm ${
                hasLiked ? "text-red-400" : "text-slate-400 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {hasLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{comment.likeCount || 0}</span>
            </button>

            {/* Reply Button */}
            {!isReply && currentUser && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
              >
                <FaReply />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows="3"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Post Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
