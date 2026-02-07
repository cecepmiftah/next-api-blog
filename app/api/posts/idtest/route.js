import Post from "@/models/Post";
import connectDB from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const { id } = await params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  const { id } = await params;
  const data = await request.json();
  try {
    const post = await Post.findByIdAndUpdate(id, data, { new: true });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  await connectDB();
  const { id } = await params;
  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
