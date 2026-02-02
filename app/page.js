import Link from 'next/link';

async function getPosts() {
  // In a real app, you'd fetch from an API.
  // To avoid issues with the dev server not being accessible, we'll simulate the fetch.
  try {
    const res = await fetch(`/api/posts`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return []; // Return an empty array on error
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Latest Posts</h1>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post._id} href={`/posts/${post._id}`}>
              <div className="block bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:scale-105 transform transition-transform duration-300 ease-in-out">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                  <p className="text-slate-400 line-clamp-3">{post.content}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <p className="text-slate-400">No posts found. Why not create one?</p>
            <Link href="/create-post" className="mt-4 inline-block px-6 py-2 text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700">
                Create Post
            </Link>
        </div>
      )}
    </div>
  );
}
