"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import UpdatePostHeader from "@/components/posts/update/UpdatePostHeader";
import UpdatePostForm from "@/components/posts/update/UpdatePostForm";
import UpdatePostSidebar from "@/components/posts/update/UpdatePostSidebar";
import UpdatePostLoading from "@/components/posts/update/UpdatePostLoading";
import UpdatePostError from "@/components/posts/update/UpdatePostError";
import { fetchPostBySlug } from "@/lib/posts-api";

// Dynamically import editor
const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] bg-slate-900 rounded-xl border border-slate-700 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading Editor...</p>
      </div>
    </div>
  ),
});

export default function UpdatePostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load post data
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    loadPostData();
  }, [slug, status]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchPostBySlug(slug);

      if (result.success) {
        // Check if user is author
        if (
          result.data.authorId !== session?.user.id &&
          result.data.authorEmail !== session?.user.email
        ) {
          setError("You are not authorized to edit this post");
          return;
        }

        setPost(result.data);
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

  const handleContentChange = (content) => {
    setPost((prev) => ({
      ...prev,
      content,
      excerpt: generateExcerpt(content),
    }));
    setHasChanges(true);
  };

  const generateExcerpt = (content) => {
    if (!content?.blocks) return "";

    const textBlocks = content.blocks
      .filter((block) => block.type === "paragraph")
      .map((block) => block.data.text)
      .join(" ")
      .replace(/<[^>]*>/g, "")
      .substring(0, 150)
      .trim();

    return textBlocks + (textBlocks.length >= 150 ? "..." : "");
  };

  const handleFieldChange = (field, value) => {
    setPost((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleTagUpdate = (tags) => {
    setPost((prev) => ({
      ...prev,
      tags,
    }));
    setHasChanges(true);
  };

  const handleFeaturedImageUpdate = (url) => {
    setPost((prev) => ({
      ...prev,
      featuredImage: url,
    }));
    setHasChanges(true);
  };

  const validatePost = () => {
    if (!post.title?.trim()) {
      setError("Title is required");
      return false;
    }

    if (!post.slug?.trim()) {
      setError("Slug is required");
      return false;
    }

    if (post.content?.blocks?.length === 0) {
      setError("Content is required");
      return false;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9\-]+$/;
    if (!slugRegex.test(post.slug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens");
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    if (!validatePost()) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          status: "draft",
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save draft");
      }

      setSaveMessage("Draft saved successfully!");
      setHasChanges(false);

      // Update local post data
      setPost(result.data);

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validatePost()) return;

    if (!window.confirm("Are you sure you want to publish this post?")) {
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${post.slug}/${post._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          status: "published",
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to publish post");
      }

      setSaveMessage("Post published successfully!");
      setHasChanges(false);

      // Redirect to post page after 2 seconds
      setTimeout(() => {
        router.push(`/posts/${post.slug}`);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to publish post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = () => {
    // Save current state to localStorage for preview
    localStorage.setItem("post_preview", JSON.stringify(post));
    window.open(`/preview/${post.slug}`, "_blank");
  };

  const handleDiscardChanges = () => {
    if (window.confirm("Are you sure you want to discard all changes?")) {
      loadPostData();
      setHasChanges(false);
      setSaveMessage("Changes discarded");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  if (loading) {
    return <UpdatePostLoading />;
  }

  if (error || !post) {
    return (
      <UpdatePostError
        error={error}
        onRetry={loadPostData}
        onBack={() => router.push("/posts")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <UpdatePostHeader
          post={post}
          hasChanges={hasChanges}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onPreview={handlePreview}
          onDiscard={handleDiscardChanges}
          isSaving={isSaving}
          isPublishing={isPublishing}
          saveMessage={saveMessage}
          error={error}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <UpdatePostForm
              post={post}
              onFieldChange={handleFieldChange}
              onContentChange={handleContentChange}
              onTagUpdate={handleTagUpdate}
              EditorComponent={EditorComponent}
            />
          </div>

          {/* Sidebar */}
          <div>
            <UpdatePostSidebar
              post={post}
              onFeaturedImageUpdate={handleFeaturedImageUpdate}
              onFieldChange={handleFieldChange}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              onPreview={handlePreview}
              isSaving={isSaving}
              isPublishing={isPublishing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
