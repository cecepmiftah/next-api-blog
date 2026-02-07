import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot be more than 300 characters"],
    },
    content: {
      type: Object,
      required: [true, "Content is required"],
    },
    featuredImage: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      default: "general",
      enum: [
        "general",
        "technology",
        "design",
        "business",
        "education",
        "health",
        "entertainment",
      ],
    },
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "published", "private"],
    },
    metaTitle: {
      type: String,
      maxlength: [70, "Meta title cannot be more than 70 characters"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot be more than 160 characters"],
    },
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Create index for better performance
// PostSchema.index({ slug: 1 });
// PostSchema.index({ status: 1, createdAt: -1 });
// PostSchema.index({ authorId: 1 });
// PostSchema.index({ tags: 1 });

// Middleware to update slug if title changes
PostSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.isModified("slug")) {
    const slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 60);
    this.slug = slug;
  }
  next();
});

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;
