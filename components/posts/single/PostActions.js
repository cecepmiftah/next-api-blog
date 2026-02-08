import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaComment,
  FaEye,
  FaThumbsUp,
} from "react-icons/fa";

const PostActions = ({
  post,
  liked,
  saved,
  onLike,
  onSave,
  onShare,
  onToggleComments,
  showComments,
  isAuthor,
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Like Button */}
          <button
            onClick={onLike}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all ${
              liked
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700"
            }`}
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
            <span>Like</span>
            <span className="font-bold">{post.likes || 0}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            className={`px-6 py-3 rounded-xl flex items-center gap-3 transition-all ${
              saved
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700"
            }`}
          >
            {saved ? <FaBookmark /> : <FaRegBookmark />}
            <span>{saved ? "Saved" : "Save"}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center gap-3 transition-colors"
          >
            <FaShareAlt />
            <span>Share</span>
          </button>
        </div>

        {/* Right Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <FaEye className="text-purple-400" />
            <span className="font-medium">{post.views || 0}</span>
            <span className="text-sm">views</span>
          </div>

          <button
            onClick={onToggleComments}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <FaComment
              className={showComments ? "text-blue-400" : "text-slate-400"}
            />
            <span>{post.comments || 0}</span>
            <span>comments</span>
          </button>

          {isAuthor && (
            <div className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-xs text-blue-400">
              Author
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostActions;
