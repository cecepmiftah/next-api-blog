import PostCard from "@/components/posts/PostCard";

const PostsGrid = ({ posts, onDelete, onStatusChange, currentUser }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          currentUser={currentUser}
          viewMode="grid"
        />
      ))}
    </div>
  );
};

export default PostsGrid;
