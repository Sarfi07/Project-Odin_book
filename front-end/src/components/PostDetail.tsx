import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import like from "../assets/like.svg";
import liked from "../assets/liked.svg";
import deleteSvg from "../assets/delete.svg";
import edit from "../assets/edit.svg";
import handleShare from "./utils/handleShare";
import Message from "./utils/Message";

// Define PostType interface based on your post schema
export interface PostType {
  id: string;
  content: string;
  author: {
    name: string;
    profileImage: string;
    id: string;
    username: string;
  };
  img_url?: string;
  createdAt: string;
  updatedAt: string;
  _count: { likes: number; comments: number };
  shareCount?: number;
  isDarkMode: boolean;
  isLikedByUser: boolean;
}

// Define CommentType interface
interface CommentType {
  id: string;
  content: string;
  author: {
    name: string;
    profileImage: string;
  };
  createdAt: string;
}

interface PostDetailProps {
  isDarkMode: boolean;
}

// Define PostDetail component
const PostDetail: React.FC<PostDetailProps> = ({ isDarkMode }) => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [likesCount, setLikesCount] = useState<number>(0);
  const [likedByUser, setLikedByUser] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleLike = async () => {
    if (!post) return;

    // Optimistically update the likes count
    const updatedLikes = likedByUser ? likesCount - 1 : likesCount + 1;
    setLikesCount(updatedLikes);
    setLikedByUser(!likedByUser);

    try {
      const response = await fetch(
        `${backend_url}/user/posts/${post.id}/like`,
        {
          method: likedByUser ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update like status.");
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert UI changes in case of error
      setLikesCount(likedByUser ? likesCount + 1 : likesCount - 1);
      setLikedByUser(likedByUser);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    const confirmation = confirm("Are you sure ?");

    if (confirmation) {
      try {
        const response = await fetch(`${backend_url}/user/posts/${post.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          navigate("/"); // Redirect after deletion
        } else {
          throw new Error("Failed to delete the post.");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleEditPost = () => {
    const confirmation = confirm("Do you want to edit this post?");
    if (confirmation) {
      if (post) {
        navigate(`/posts/${post.id}/edit`); // Navigate to edit page
      }
    }
  };

  useEffect(() => {
    // Fetch post and comments by postId
    const fetchPostData = async () => {
      try {
        const response = await fetch(`${backend_url}/user/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setPost(data.post);
        setCurrentUser(data.currentUserId);
        setLikedByUser(data.post.isLikedByUser);
        setLikesCount(data.post._count.likes);
        setComments(data.comments);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchPostData();
  }, [postId, token, backend_url]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${backend_url}/user/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div
      className={`p-4 rounded ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {linkCopied && <Message message="Link copied" type="success" />}
      {post && (
        <div className="max-w-3xl mx-auto">
          {/* Post header */}
          <div className="flex justify-between mb-4 pr-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate(`/people/${post.author.id}`)}
            >
              <img
                src={post.author.profileImage}
                alt={post.author.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-bold">{post.author.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Display Edit/Delete buttons if currentUser is the post author */}
            {currentUser && post.author.id === currentUser && (
              <div className="flex space-x-4 mb-4 justify-self-end cursor-pointer">
                <img onClick={handleEditPost} src={edit} />

                <img onClick={handleDeletePost} src={deleteSvg} />
              </div>
            )}
          </div>

          {/* Post content */}
          <div className="mb-4">
            <p>{post.content}</p>
            {post.img_url && (
              <img
                src={post.img_url}
                alt="Post image"
                className="w-full max-h-[500px] object-cover mt-4 rounded-lg"
              />
            )}
          </div>

          {/* Post actions */}
          <div className="flex items-center justify-between mb-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 p-auto text-blue-500"
              aria-label={likedByUser ? "Unlike this post" : "Like this post"}
            >
              {likedByUser ? (
                <img src={liked} alt="Liked icon" />
              ) : (
                <img src={like} alt="Like icon" />
              )}
              <p className="justify-self-center">{likesCount}</p>
            </button>

            {/* Share Button */}
            <button
              onClick={() => handleShare({ postId: post.id, setLinkCopied })}
              className="text-blue-500"
              aria-label="Share this post"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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
            </button>
          </div>

          <br></br>

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
        </div>
      )}
    </div>
  );
};

export default PostDetail;
