import Post from "@/models/Post";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDB();
    try {
        const posts = await Post.find({}).sort({ createdAt: -1 });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}

export async function POST(request) {
    await connectDB();
    const data = await request.json();

    try{
        const post = await Post.create(data);
        return NextResponse.json({ message: "Post created successfully", post }, { status: 201 });
    } catch(error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}