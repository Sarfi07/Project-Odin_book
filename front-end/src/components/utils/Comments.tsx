interface CommentType {
  id: string;
  content: string;
  author: {
    name: string;
    profileImage: string;
  };
  createdAt: string;
}

interface CommentsProps {
  handleCommentSubmit: React.FormEventHandler;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  newComment: string;
  isDarkMode: boolean;
  comments: CommentType[];
}

const CommentsComp: React.FC<CommentsProps> = ({
  handleCommentSubmit,
  setNewComment,
  newComment,
  isDarkMode,
  comments,
}) => {
  return (
    <>
      {/* Comment form */}
      <form onSubmit={handleCommentSubmit} className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className={`w-full p-2 border rounded-lg ${
            isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
          } `}
          rows={3}
          placeholder="Add a comment..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
        >
          Submit
        </button>
      </form>
      <br />
      {/* Comments section */}
      <div className="border-t pt-4">
        <h4 className="font-bold mb-2">Comments ({comments.length})</h4>
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start mb-4">
            <img
              src={comment.author.profileImage}
              alt={comment.author.name}
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <h5 className="font-bold">{comment.author.name}</h5>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
              <p>{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentsComp;
