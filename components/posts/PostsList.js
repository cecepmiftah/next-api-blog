import PostCard from "@/components/posts/PostCard";

const PostsList = ({ posts, onDelete, onStatusChange, currentUser }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          currentUser={currentUser}
          viewMode="list"
        />
      ))}
    </div>
  );
};

export default PostsList;
