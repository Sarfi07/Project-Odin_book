import React, { useEffect, useState } from "react";
import { PostType } from "../CustomTypes";
import { useNavigate } from "react-router-dom";
import like from "../../assets/like.svg";
import liked from "../../assets/liked.svg";
import CommentsComp from "./Comments";

interface CommentType {
  id: string;
  content: string;
  author: {
    name: string;
    profileImage: string;
  };
  createdAt: string;
}

const Post: React.FC<PostType> = ({
  id,
  content,
  author,
  img_url,
  createdAt,
  _count,
  onShare,
  isDarkMode,
  isLikedByUser,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString();
  const token = localStorage.getItem("token");
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [likesCount, setLikesCount] = useState(_count.likes);
  const [likedByUser, setLikedByUser] = useState(isLikedByUser);
  const navigate = useNavigate();
  const [openComments, setOpenComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      const response = await fetch(`${backend_url}/user/posts/${id}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    };

    fetchComments();
  }, []);

  const handleLike = async () =>
    // id: string,
    // isLikedByUser: boolean,
    // _count: { likes: number; comments: number }
    {
      // Optimistically update the likes count

      try {
        console.log(likedByUser);
        const response = await fetch(`${backend_url}/user/posts/${id}/like`, {
          method: likedByUser ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Parse response
        if (!response.ok) {
          throw new Error("Failed to update like status.");
        }

        const data = await response.json();
        console.log(data);

        const updatedLikes = likedByUser ? likesCount - 1 : likesCount + 1;

        // Update UI optimistically
        setLikesCount(updatedLikes);
        setLikedByUser(!likedByUser);
      } catch (error) {
        console.error("Error updating like:", error);

        // Revert UI changes in case of error
        setLikesCount(likedByUser ? likesCount + 1 : likesCount - 1);
        setLikedByUser(likedByUser);
      }
    };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${backend_url}/user/posts/${id}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div
      className={`rounded-lg shadow-md p-4 mb-4 m-auto ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div onClick={() => navigate(`/posts/${id}`)} className="cursor-pointer">
        {/* Post Header */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={author.profileImage}
            alt={author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4
              className={`font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {author.name}
            </h4>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <p className={`${isDarkMode ? "text-gray-300" : "text-gray-800"} mb-4`}>
          {content}
        </p>

        {/* Post Image (if available) */}
        {img_url && (
          <div className="flex justify-center">
            <img
              src={img_url}
              alt="Post image"
              className="max-h-[36rem] w-auto object-contain rounded-lg mb-4"
            />
          </div>
        )}
      </div>
      {/* Post Actions */}
      <div className="flex justify-between items-center">
        {/* Likes */}
        <button
          className={`flex items-center space-x-2 ${
            isDarkMode
              ? "text-gray-400 hover:text-blue-300"
              : "text-gray-700 hover:text-blue-500"
          } ${likedByUser && "text-blue-300"}`}
          onClick={() => handleLike()}
        >
          <img
            src={likedByUser ? liked : like}
            alt={likedByUser ? "Unlike" : "Like"}
          />
          <span>{likesCount} Likes</span>
        </button>

        <button
          className={`flex items-center space-x-2 ${
            isDarkMode
              ? "text-gray-400 hover:text-green-300"
              : "text-gray-700 hover:text-green-500"
          }`}
          onClick={() => setOpenComments(!openComments)}
        >
          {comments && comments.length} Comments
        </button>

        {/* Share */}
        <button
          className={`flex items-center space-x-2 ${
            isDarkMode
              ? "text-gray-400 hover:text-green-300"
              : "text-gray-700 hover:text-green-500"
          }`}
          onClick={onShare}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12h3m4 0a8 8 0 11-16 0 8 8 0 0116 0z"
            />
          </svg>
          <span>Share</span>
        </button>
      </div>

      {openComments && (
        <CommentsComp
          handleCommentSubmit={handleCommentSubmit}
          setNewComment={setNewComment}
          newComment={newComment}
          isDarkMode={isDarkMode}
          comments={comments}
        />
      )}
    </div>
  );
};

export default Post;
