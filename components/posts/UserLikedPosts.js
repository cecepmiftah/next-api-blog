import connectDB from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";
import Link from "next/link";
import { FaHeart, FaLock, FaCalendar } from "react-icons/fa";

export default async function UserLikedPosts({ userId }) {
  await connectDB();

  // Find posts where user is in likes array
  const likedPosts = await Post.find({ likes: userId })
    .sort({ createdAt: -1 })
    .populate("author", "name image")
    .limit(10);

  if (!likedPosts || likedPosts.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-slate-400 text-6xl mb-4">💖</div>
        <h3 className="text-xl font-bold mb-2">No liked posts yet</h3>
        <p className="text-slate-400">Posts you like will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4 p-3 bg-slate-900/30 rounded-lg">
        <FaLock className="text-yellow-400" />
        <span>This section is private and only visible to you</span>
      </div>

      {likedPosts.map((post) => (
        <div
          key={post._id}
          className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-5 hover:border-slate-600/50 transition-colors duration-300"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <Link href={`/posts/${post._id}`}>
                <h4 className="text-lg font-bold hover:text-blue-400 transition-colors">
                  {post.title}
                </h4>
              </Link>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                <div className="flex items-center gap-1">
                  <FaCalendar className="text-xs" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaHeart className="text-red-400 text-xs" />
                  <span>You liked this</span>
                </div>
              </div>
            </div>
            {post.author?.image && (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-10 h-10 rounded-full border border-slate-600"
              />
            )}
          </div>

          <p className="text-slate-300 line-clamp-3">
            {post.content.substring(0, 200)}...
          </p>

          <div className="mt-4 flex justify-between items-center">
            <Link
              href={`/posts/${post._id}`}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Read more →
            </Link>
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
              ❤️ You liked this
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
