import CommentItem from "@/components/comments/CommentItem";

const CommentList = ({
  comments,
  onUpdate,
  onDelete,
  onReplyAdded,
  currentUser,
}) => {
  // Organize comments into threads (parent + replies)
  const parentComments = comments.filter((comment) => !comment.parentId);
  const replies = comments.filter((comment) => comment.parentId);
  console.log("CommentList replies:", replies);

  // Group replies by parent
  const repliesByParent = replies.reduce((acc, reply) => {
    if (!acc[reply.parentId]) {
      acc[reply.parentId] = [];
    }
    acc[reply.parentId].push(reply);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {parentComments.map((comment) => (
        <div key={comment._id} className="comment-thread">
          <CommentItem
            comment={comment}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onReplyAdded={onReplyAdded}
            currentUser={currentUser}
          />

          {/* Replies */}
          {repliesByParent[comment._id] && (
            <div className="ml-12 mt-4 space-y-4">
              {repliesByParent[comment._id]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onReplyAdded={onReplyAdded}
                    currentUser={currentUser}
                    isReply={true}
                  />
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
