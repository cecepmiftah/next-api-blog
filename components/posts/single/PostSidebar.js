import {
  FaShareAlt,
  FaLink,
  FaPrint,
  FaBookmark,
  FaHeart,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import { useEffect, useState } from "react";

const PostSidebar = ({ post, author, isAuthor }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Cek jika post sudah di-bookmark
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setIsBookmarked(bookmarks.includes(post._id));
  }, [post._id]);

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id) => id !== post._id);
      localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      localStorage.setItem(
        "bookmarks",
        JSON.stringify([...bookmarks, post._id]),
      );
      setIsBookmarked(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);
  const shareText = encodeURIComponent(post.excerpt || "");

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}&summary=${shareText}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    email: `mailto:?subject=${shareTitle}&body=${shareText}%20${shareUrl}`,
  };

  return (
    <div className="space-y-8">
      {/* Share Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaShareAlt className="text-blue-400" />
          Share this post
        </h3>

        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => window.open(shareLinks.twitter, "_blank")}
              className="flex-1 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 flex items-center justify-center gap-2 transition-colors"
            >
              <FaTwitter />
              <span className="text-sm">Twitter</span>
            </button>

            <button
              onClick={() => window.open(shareLinks.facebook, "_blank")}
              className="flex-1 p-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-lg text-blue-500 flex items-center justify-center gap-2 transition-colors"
            >
              <FaFacebook />
              <span className="text-sm">Facebook</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(shareLinks.linkedin, "_blank")}
              className="flex-1 p-3 bg-blue-700/10 hover:bg-blue-700/20 border border-blue-700/30 rounded-lg text-blue-600 flex items-center justify-center gap-2 transition-colors"
            >
              <FaLinkedin />
              <span className="text-sm">LinkedIn</span>
            </button>

            <button
              onClick={() => window.open(shareLinks.whatsapp, "_blank")}
              className="flex-1 p-3 bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 rounded-lg text-green-500 flex items-center justify-center gap-2 transition-colors"
            >
              <FaWhatsapp />
              <span className="text-sm">WhatsApp</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(shareLinks.email, "_self")}
              className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <FaEnvelope />
              <span className="text-sm">Email</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <button
            onClick={handleCopyLink}
            className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <FaLink />
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>

        <div className="space-y-3">
          <button
            onClick={handleBookmark}
            className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <FaBookmark
                className={isBookmarked ? "text-yellow-400" : "text-slate-400"}
              />
              <span
                className={isBookmarked ? "text-yellow-400" : "text-slate-300"}
              >
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              {isBookmarked ? "✓" : "+"}
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-3 transition-colors"
          >
            <FaPrint className="text-slate-400" />
            <span className="text-slate-300">Print</span>
          </button>

          {isAuthor && (
            <div className="p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 <strong>Author View:</strong> You're viewing your own post
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Author Info Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-bold mb-4">About the Author</h3>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {author?.charAt(0) || "A"}
          </div>
          <div>
            <h4 className="font-bold text-white">{author || "Anonymous"}</h4>
            <p className="text-sm text-slate-400">Content Creator</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          Published {post.authorPosts || "several"} posts with total of{" "}
          {post.authorViews || 0} views
        </p>

        <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
          View Profile
        </button>
      </div>

      {/* Table of Contents (optional) */}
      {post.content?.blocks?.length > 3 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-bold mb-4">Table of Contents</h3>
          <div className="space-y-2">
            {post.content.blocks
              .filter((block) => block.type === "header")
              .slice(0, 5)
              .map((block, index) => (
                <a
                  key={index}
                  href={`#${block.data.text.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block py-2 px-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">#</span>
                    <span className="truncate">{block.data.text}</span>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostSidebar;
