import Post from "@/models/Post";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    await connectDB();
    try {
        const post = await Post.findById(params.id);
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
