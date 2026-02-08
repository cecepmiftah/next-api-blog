import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    // Post reference
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // Comment content
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    // Author information
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: "",
    },

    // Parent comment for nested replies
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    // Comment status
    status: {
      type: String,
      enum: ["approved", "pending", "spam", "deleted"],
      default: "approved",
    },

    // Likes/upvotes
    likes: [
      {
        userId: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Comment depth (for nested comments)
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Edit history
    edited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        content: String,
        editedAt: Date,
      },
    ],

    // Metadata
    isAuthor: {
      type: Boolean,
      default: false,
    },

    // Flags
    isPinned: {
      type: Boolean,
      default: false,
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
// CommentSchema.index({ postId: 1, createdAt: -1 });
// CommentSchema.index({ parentId: 1, createdAt: -1 });
// CommentSchema.index({ authorId: 1, createdAt: -1 });
// CommentSchema.index({ status: 1, createdAt: -1 });

// Virtual for like count
CommentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Method to check if user liked the comment
CommentSchema.methods.hasLiked = function (userId) {
  return this.likes.some((like) => like.userId === userId);
};

// Method to add like
CommentSchema.methods.addLike = function (userId) {
  if (!this.hasLiked(userId)) {
    this.likes.push({ userId });
    return true;
  }
  return false;
};

// Method to remove like
CommentSchema.methods.removeLike = function (userId) {
  const initialLength = this.likes.length;
  this.likes = this.likes.filter((like) => like.userId !== userId);
  return this.likes.length < initialLength;
};

// Pre-save middleware to update isAuthor field
CommentSchema.pre("save", async function (next) {
  if (this.isModified("authorId")) {
    const Post = mongoose.model("Post");
    const post = await Post.findById(this.postId);
    if (post) {
      this.isAuthor = post.authorId === this.authorId;
    }
  }
  next();
});

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

export default Comment;
