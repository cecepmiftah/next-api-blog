"use client";

import { useState } from "react";
import { FaPaperPlane, FaUser } from "react-icons/fa";
import { useSession } from "next-auth/react";

const CommentForm = ({ postId, onCommentAdded, className = "" }) => {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please write a comment");
      return;
    }

    if (!session) {
      setError("You must be logged in to comment");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        onCommentAdded(result.data);
        setContent("");
      } else {
        throw new Error(result.error || "Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div
        className={`${className} p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 text-center`}
      >
        <h3 className="text-lg font-bold mb-2">Join the discussion</h3>
        <p className="text-slate-400 mb-4">Sign in to post comments</p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-slate-800/30 rounded-xl border border-slate-700/50 p-6`}
    >
      <h3 className="text-lg font-bold mb-4">Post a comment</h3>

      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name}
            className="w-10 h-10 rounded-full border border-slate-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
        )}
        <div>
          <p className="font-medium text-white">{session.user.name}</p>
          <p className="text-sm text-slate-400">{session.user.email}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Share your thoughts..."
          rows="4"
          className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-slate-400">
            {content.length}/2000 characters
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span>Post Comment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
