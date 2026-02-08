import {
  FaSave,
  FaPaperPlane,
  FaEye,
  FaUndo,
  FaHistory,
  FaCalendar,
} from "react-icons/fa";
import { format } from "date-fns";

const UpdatePostHeader = ({
  post,
  hasChanges,
  onSaveDraft,
  onPublish,
  onPreview,
  onDiscard,
  isSaving,
  isPublishing,
  saveMessage,
  error,
}) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mb-8">
      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-shake">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-lg">!</span>
            </div>
            <p>{error}</p>
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-lg">✓</span>
            </div>
            <p>{saveMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Edit Post
              </h1>

              <div
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  post.status === "published"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : post.status === "draft"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <FaHistory className="text-blue-400" />
                <span>Created: {formatDate(post.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <FaCalendar className="text-green-400" />
                <span>Updated: {formatDate(post.updatedAt)}</span>
              </div>

              {hasChanges && (
                <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {hasChanges && (
              <button
                onClick={onDiscard}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-medium flex items-center gap-2"
              >
                <FaUndo />
                <span>Discard</span>
              </button>
            )}

            <button
              onClick={onPreview}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-medium flex items-center gap-2"
            >
              <FaEye />
              <span>Preview</span>
            </button>

            <button
              onClick={onSaveDraft}
              disabled={isSaving || isPublishing}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Draft</span>
                </>
              )}
            </button>

            <button
              onClick={onPublish}
              disabled={isPublishing || isSaving}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:opacity-90 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>
                    {post.status === "published" ? "Update" : "Publish"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePostHeader;
