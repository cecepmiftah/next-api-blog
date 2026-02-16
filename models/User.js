import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: "",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual untuk menghitung jumlah posts
userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "authorId",
});

// Virtual untuk menghitung jumlah liked posts
userSchema.virtual("likedPosts", {
  ref: "Post",
  localField: "_id",
  foreignField: "likes",
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
