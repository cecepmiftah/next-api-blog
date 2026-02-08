import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";
import Link from "next/link";

const PostError = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <FaExclamationTriangle className="text-3xl text-red-400" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>

          <p className="text-slate-400 mb-2">
            {error ||
              "The post you are looking for does not exist or has been removed."}
          </p>

          <p className="text-slate-500 text-sm mb-8">
            Please check the URL or try searching for the post.
          </p>

          <div className="space-y-4">
            <button
              onClick={onRetry}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <FaRedo />
              Try Again
            </button>

            <Link
              href="/posts"
              className="w-full block px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <FaHome />
              Browse Posts
            </Link>

            <Link
              href="/"
              className="w-full block px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostError;
