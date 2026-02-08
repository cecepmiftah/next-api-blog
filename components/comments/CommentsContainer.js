"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CommentList from "@/components/comments/CommentList";
import CommentForm from "@/components/comments/CommentForm";
import CommentsHeader from "@/components/comments/CommentsHeader";
import CommentsLoading from "@/components/comments/CommentsLoading";
import { fetchComments } from "@/lib/comments-api";

const CommentsContainer = ({ postId }) => {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });

  // Load comments
  const loadComments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        postId,
        sort: sortBy,
        page: page.toString(),
        limit: "20",
      });

      const result = await fetchComments(queryParams.toString());

      if (result.success) {
        if (page === 1) {
          setComments(result.data);
        } else {
          setComments((prev) => [...prev, ...result.data]);
        }
        setPagination(
          result.pagination || {
            page,
            total: result.data.length,
            pages: 1,
          },
        );
      } else {
        throw new Error(result.error || "Failed to load comments");
      }
    } catch (err) {
      console.error("Error loading comments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId, sortBy]);

  // Handle new comment
  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
    setPagination((prev) => ({
      ...prev,
      total: prev.total + 1,
    }));
  };

  // Handle comment update
  const handleCommentUpdated = (updatedComment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment,
      ),
    );
  };

  // Handle comment delete
  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    setPagination((prev) => ({
      ...prev,
      total: prev.total - 1,
    }));
  };

  // Handle reply added
  const handleReplyAdded = async (parentId, newReply) => {
    await fetchComments("postId=" + postId + "&parentId=" + parentId);
    setComments((prev) => [...prev, newReply]);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      loadComments(pagination.page + 1);
    }
  };

  const totalComments = pagination.total;

  if (loading && comments.length === 0) {
    return <CommentsLoading />;
  }

  return (
    <div className="comments-container">
      {/* Header */}
      <CommentsHeader
        totalComments={totalComments}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onRefresh={() => loadComments(1)}
      />

      {/* Comment Form */}
      {status === "authenticated" ? (
        <CommentForm
          postId={postId}
          onCommentAdded={handleCommentAdded}
          className="mb-8"
        />
      ) : (
        <div className="mb-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center">
          <h3 className="text-lg font-bold mb-2">Join the discussion</h3>
          <p className="text-slate-400 mb-4">Sign in to post comments</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => loadComments(1)}
            className="mt-2 text-sm text-red-300 hover:text-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-xl font-bold mb-2">No comments yet</h3>
          <p className="text-slate-400">
            {session
              ? "Be the first to share your thoughts!"
              : "Sign in to be the first to comment!"}
          </p>
        </div>
      ) : (
        <>
          <CommentList
            comments={comments}
            onUpdate={handleCommentUpdated}
            onDelete={handleCommentDeleted}
            onReplyAdded={handleReplyAdded}
            currentUser={session?.user}
          />

          {/* Load More */}
          {pagination.page < pagination.pages && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {loading
                  ? "Loading..."
                  : `Load More (${pagination.total - comments.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentsContainer;
