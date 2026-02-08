"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import PostHeader from "@/components/posts/single/PostHeader";
import PostContent from "@/components/posts/single/PostContent";
import PostSidebar from "@/components/posts/single/PostSidebar";
import PostActions from "@/components/posts/single/PostActions";
import PostComments from "@/components/posts/single/PostComments";
import PostRelated from "@/components/posts/single/PostRelated";
import PostLoading from "@/components/posts/single/PostLoading";
import PostError from "@/components/posts/single/PostError";
import { fetchPostBySlug } from "@/lib/posts-api";

// Dynamically import editor untuk read-only mode
const EditorReadOnly = dynamic(() => import("@/components/EditorReadOnly"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] bg-slate-900 rounded-xl border border-slate-700 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-slate-400 text-sm">Loading content...</p>
      </div>
    </div>
  ),
});

export default function SinglePostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);

  // Load post data
  useEffect(() => {
    loadPostData();
  }, [slug]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchPostBySlug(slug);

      if (result.success) {
        setPost(result.data);

        // Cek jika user sudah like/save
        if (session) {
          checkUserInteractions(result.data._id);
        }

        // Load related posts
        loadRelatedPosts(result.data);
      } else {
        throw new Error(result.error || "Post not found");
      }
    } catch (err) {
      console.error("Error loading post:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async (postId) => {
    try {
      // Simpan di localStorage untuk demo
      const likedPosts = JSON.parse(
        localStorage.getItem("liked_posts") || "[]",
      );
      const savedPosts = JSON.parse(
        localStorage.getItem("saved_posts") || "[]",
      );

      setLiked(likedPosts.includes(postId));
      setSaved(savedPosts.includes(postId));
    } catch (err) {
      console.error("Error checking interactions:", err);
    }
  };

  const loadRelatedPosts = async (currentPost) => {
    try {
      // Fetch related posts berdasarkan category dan tags
      const queryParams = new URLSearchParams({
        status: "published",
        category: currentPost.category,
        limit: 3,
        page: 1,
      });

      const response = await fetch(`/api/posts?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        // Filter out current post
        const related = result.data.filter((p) => p._id !== currentPost._id);
        setRelatedPosts(related.slice(0, 3));
      }
    } catch (err) {
      console.error("Error loading related posts:", err);
    }
  };

  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setLiked(!liked);
        setPost((prev) => ({
          ...prev,
          likes: liked ? prev.likes - 1 : prev.likes + 1,
        }));

        // Update localStorage untuk demo
        const likedPosts = JSON.parse(
          localStorage.getItem("liked_posts") || "[]",
        );
        if (liked) {
          localStorage.setItem(
            "liked_posts",
            JSON.stringify(likedPosts.filter((id) => id !== post._id)),
          );
        } else {
          localStorage.setItem(
            "liked_posts",
            JSON.stringify([...likedPosts, post._id]),
          );
        }
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleSave = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}/save`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setSaved(!saved);

        // Update localStorage untuk demo
        const savedPosts = JSON.parse(
          localStorage.getItem("saved_posts") || "[]",
        );
        if (saved) {
          localStorage.setItem(
            "saved_posts",
            JSON.stringify(savedPosts.filter((id) => id !== post._id)),
          );
        } else {
          localStorage.setItem(
            "saved_posts",
            JSON.stringify([...savedPosts, post._id]),
          );
        }
      }
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleEdit = () => {
    router.push(`/posts/update/${post.slug}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.slug}/${post._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        alert("Post deleted successfully!");
        router.push("/posts");
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert("Failed to delete post: " + err.message);
    }
  };

  if (loading) {
    return <PostLoading />;
  }

  if (error || !post) {
    return <PostError error={error} onRetry={loadPostData} />;
  }

  const isAuthor =
    session &&
    (post.authorId === session.user.id ||
      post.authorEmail === session.user.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PostHeader
          post={post}
          isAuthor={isAuthor}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            )}

            {/* Content */}
            <PostContent content={post.content} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/posts?search=${tag}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full text-sm transition-colors"
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <PostActions
              post={post}
              liked={liked}
              saved={saved}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onToggleComments={() => setShowComments(!showComments)}
              showComments={showComments}
              isAuthor={isAuthor}
            />

            {/* Comments */}
            {showComments && <PostComments postId={post._id} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <PostSidebar
              post={post}
              author={post.authorName}
              isAuthor={isAuthor}
            />

            {/* Related Posts */}
            {relatedPosts.length > 0 && <PostRelated posts={relatedPosts} />}
          </div>
        </div>
      </div>
    </div>
  );
}
