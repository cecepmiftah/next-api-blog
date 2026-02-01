import Post from "@/models/Post";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    // db
    await connectDB();

    const data = await request.json();

    try{
        const post = await Post.create(data);
        return NextResponse.json({
            message: "Post created successfully",
            post
        }, {
            status: 201
        })
    } catch(error) {
        console.log(error);
        return NextResponse.json({
            message: "Something went wrong"
        }, {
            status: 500
        })

    }
}