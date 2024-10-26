import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Message from "./utils/Message";

interface PostCreationProps {
  isDarkMode: boolean;
}

const PostCreation: React.FC<PostCreationProps> = ({ isDarkMode }) => {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // edit post scenario
  const { postId } = useParams<{ postId: string }>();
  const token = localStorage.getItem("token");
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const [error, setError] = useState("");

  // Fetch post data if postId is available
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`${backend_url}/user/posts/${postId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            setError(response.statusText);
          }
          const data = await response.json();
          setContent(data.post.content);
          setPreviewImage(data.post.img_url); // Preload image preview if it exists
        } catch (error) {
          console.error("Failed to fetch post data:", error);
        }
      };

      fetchPost();
    }
  }, [backend_url, token, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // onCreatePost(content, image);

    const formData = new FormData();

    formData.append("content", content);

    if (image) {
      formData.append("image", image);
    }

    const token = localStorage.getItem("token"); // Assuming you're using token-based authentication

    try {
      setLoading(true);
      let response;

      if (postId) {
        response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/user/posts/${postId}`,
          {
            method: `PUT`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData, // Send form data (content and image) to the backend
          }
        );
      } else {
        response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/user/posts/create`,
          {
            method: `POST`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData, // Send form data (content and image) to the backend
          }
        );
      }

      if (!response.ok) {
        setError(response.statusText);
        throw new Error("Failed to create post");
      }

      const data = await response.json();
      console.log("Post created:", data);
      setContent(""); // Clear form
      setImage(null);
      navigate(`/posts/${data.postId}`); // Handle post creation success
    } catch (error: unknown) {
      console.error("Error creating post:", error);
    } finally {
      setContent("");
      setImage(null);
      setPreviewImage(null); // Reset image preview
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      setPreviewImage(URL.createObjectURL(selectedImage)); // Preview the image
    }
  };

  if (error) return <Message message={error} type="error" />;

  return (
    <div
      className={`p-6 max-w-xl mx-auto my-8 border rounded-lg ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        {/* Post Content */}
        <div className="mb-4">
          <label
            htmlFor="content"
            className={`block text-lg font-semibold mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Post Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
            }`}
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label
            htmlFor="image"
            className={`block text-lg font-semibold mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Upload an Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-2 block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
          />
          {previewImage && (
            <div className="mt-4">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold"
        >
          {loading ? "Posting, please wait...." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default PostCreation;
