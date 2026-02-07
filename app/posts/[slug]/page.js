import DeleteButton from "@/components/DeleteButton";
import UpdateButton from "@/components/UpdateButton";
import Link from "next/link";

async function getPost(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`);
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await getPost(id);
  return {
    title: `${post.title} | Next.js Blog`,
    description: post.content.substring(0, 150),
  };
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="text-indigo-400 hover:text-indigo-500 mb-8 inline-block"
      >
        &larr; Back to all posts
      </Link>
      <article className="space-y-6 bg-slate-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-5xl font-extrabold text-white leading-tight">
          {post.title}
        </h1>
        <p className="text-slate-300 whitespace-pre-wrap text-lg leading-relaxed">
          {post.content}
        </p>
        <div className="flex gap-4">
          <DeleteButton id={post._id} />
          <UpdateButton id={post._id} />
        </div>
      </article>
    </div>
  );
}
