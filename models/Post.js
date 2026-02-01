import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [255, "Title cannot be more than 255 characters"]
  },
  content: {
    type: String,
    required: [true, "Please add a description"],
    required: true,
  },
}, 
{ timestamps: true }
    );

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
