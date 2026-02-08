"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FaUser,
  FaCalendar,
  FaReply,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";

const PostComments = ({ postId }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      // Simulasi API call
      setTimeout(() => {
        // Mock data
        const mockComments = [
          {
            id: "1",
            author: "John Doe",
            authorId: "user1",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            content: "Great post! Really enjoyed reading this.",
            createdAt: "2024-01-15T10:30:00Z",
            likes: 5,
            replies: [
              {
                id: "1-1",
                author: "Jane Smith",
                authorId: "user2",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
                content: "Thanks John! Glad you liked it.",
                createdAt: "2024-01-15T11:00:00Z",
                likes: 2,
              },
            ],
          },
          {
            id: "2",
            author: "Alex Johnson",
            authorId: "user3",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            content: "Very informative. Could you elaborate more on section 3?",
            createdAt: "2024-01-14T14:20:00Z",
            likes: 3,
            replies: [],
          },
        ];

        setComments(mockComments);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading comments:", error);
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    try {
      const newCommentObj = {
        id: Date.now().toString(),
        author: session.user.name,
        authorId: session.user.id,
        avatar:
          session.user.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`,
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
      };

      if (replyingTo) {
        // Add as reply
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === replyingTo
              ? { ...comment, replies: [...comment.replies, newCommentObj] }
              : comment,
          ),
        );
        setReplyingTo(null);
      } else if (editingComment) {
        // Edit existing comment
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === editingComment) {
              return { ...comment, content: newComment };
            }
            // Check replies
            if (comment.replies.some((reply) => reply.id === editingComment)) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === editingComment
                    ? { ...reply, content: newComment }
                    : reply,
                ),
              };
            }
            return comment;
          }),
        );
        setEditingComment(null);
      } else {
        // Add new comment
        setComments((prev) => [newCommentObj, ...prev]);
      }

      setNewComment("");

      // Simulate API call
      // await fetch(`/api/posts/${postId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: newComment, parentId: replyingTo })
      // });
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleDeleteComment = async (commentId, isReply = false) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      if (isReply) {
        setComments((prev) =>
          prev.map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== commentId),
          })),
        );
      } else {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId),
        );
      }

      // Simulate API call
      // await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      //   method: 'DELETE'
      // });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isAuthor = session && comment.authorId === session.user.id;

    return (
      <div className={`${isReply ? "ml-12 mt-4" : ""}`}>
        <div className="bg-slate-800/30 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <img
              src={comment.avatar}
              alt={comment.author}
              className="w-10 h-10 rounded-full border border-slate-700"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-white">{comment.author}</h4>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{formatDate(comment.createdAt)}</span>
                    {comment.likes > 0 && <span>❤️ {comment.likes}</span>}
                  </div>
                </div>

                {isAuthor && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setNewComment(comment.content);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-400"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id, isReply)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-slate-300 mb-3">{comment.content}</p>

              <div className="flex gap-4">
                {!isReply && session && (
                  <button
                    onClick={() => {
                      setReplyingTo(comment.id);
                      setEditingComment(null);
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <FaReply size={12} />
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {comment.replies &&
          comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <h3 className="text-2xl font-bold mb-6">
        Comments (
        {comments.reduce(
          (total, comment) => total + 1 + comment.replies.length,
          0,
        )}
        )
      </h3>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={
                session.user.image ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`
              }
              alt={session.user.name}
              className="w-10 h-10 rounded-full border border-slate-700"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyingTo
                    ? "Write your reply..."
                    : editingComment
                      ? "Edit your comment..."
                      : "Share your thoughts..."
                }
                rows={3}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />

              {(replyingTo || editingComment) && (
                <div className="mt-2 mb-3 flex items-center gap-2 text-sm text-slate-400">
                  <span>
                    {replyingTo ? "Replying to comment" : "Editing comment"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setEditingComment(null);
                      setNewComment("");
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane />
                  {replyingTo ? "Reply" : editingComment ? "Update" : "Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
          <h4 className="text-lg font-bold mb-2">Join the discussion</h4>
          <p className="text-slate-400 mb-4">Sign in to post comments</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <h4 className="text-xl font-bold mb-2">No comments yet</h4>
            <p className="text-slate-400">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default PostComments;
