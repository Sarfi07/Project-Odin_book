import Post from "./Post";
import { PostType } from "../CustomTypes";
import { useState, useEffect } from "react";
import Message from "./Message";
import { useNavigate } from "react-router-dom";
import handleShare from "./handleShare";

interface FeedProps {
  isDarkMode: boolean;
}

export const Feed: React.FC<FeedProps> = ({ isDarkMode }) => {
  const [posts, setPosts] = useState<[PostType] | []>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`${backend_url}/user/posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Unauthorized");
          navigate("/login");
        }
        navigate("/login");
        throw new Error("falied to fetch posts");
      }

      const data = await res.json();
      if (!data.success) {
        setError("Failed to get posts");
      } else {
        setPosts(data.posts);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token, backend_url, navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  if (error) return <Message message={error} type="error" />;
  if (loading) return <>Loading...</>;

  return (
    <div className={`feed ${isDarkMode ? "dark" : ""}`}>
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {linkCopied && <Message message="Link copied" type="info" />}

      {posts.length
        ? posts.map((post) => (
            <Post
              key={post.id}
              {...post}
              onShare={() => handleShare({ postId: post.id, setLinkCopied })}
              isDarkMode={isDarkMode}
            />
          ))
        : "No posts found"}
    </div>
  );
};
