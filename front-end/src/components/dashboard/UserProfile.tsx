import React, { useEffect, useState } from "react";
import { PostType, userObj } from "../CustomTypes";
import { useParams } from "react-router-dom";
import Post from "../utils/Post";
import handleShare from "../utils/handleShare";
import Message from "../utils/Message";

interface ProfileProps {
  currentUserInfo: userObj | null;
  isDarkMode: boolean;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UserProfile: React.FC<ProfileProps> = ({ isDarkMode }) => {
  const [user, setUser] = useState<userObj | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  // const [followers, setFollowers] = useState<userObj[]>([]);
  // const [following, setFollowing] = useState<userObj[]>([]);
  const [isRequested, setIsRequested] = useState<boolean>(false);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const [posts, setPosts] = useState<[PostType] | []>([]);
  const [error, setError] = useState("");

  const { id } = useParams();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const followingResponse = await fetch(
          `${backendUrl}/user/following/check`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ followingId: id }),
          }
        );
        const followingData = await followingResponse.json();
        setIsFollowed(followingData.isFollowed);
        setIsFollowing(followingData.isFollowing);
        setIsRequested(followingData.isRequested);

        const response = await fetch(`${backendUrl}/user/people/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.message) {
          setError(data.message);
        } else {
          setUser(data.profile);
          setPosts(data.posts);
        }
        // setFollowers(data.followers);
        // setFollowing(data.followings);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [token, id, isFollowing]);

  const handleFollowToggle = async () => {
    setIsRequested(false);
    try {
      if (isFollowing) return;
      if (isFollowed) {
        const method = "DELETE";
        const req = await fetch(`${backendUrl}/user/following/${id}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await req.json();
        console.log(data);
        if (data.deleted) {
          setIsRequested(false);
          setIsFollowed(false);
        } else {
          setIsRequested(data.requested);
        }
      } else {
        const method = isRequested ? "DELETE" : "POST";
        const req = await fetch(`${backendUrl}/user/followingRequest/${id}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await req.json();
        console.log(data);
        if (data.deleted) {
          setIsRequested(false);
          setIsFollowed(false);
          setIsFollowing(false);
        } else {
          setIsRequested(data.requested);
        }
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);
    }
  };

  if (error) return <Message message={error} type="error" />;
  if (!user) return <p>Loading...</p>;

  return (
    <div
      className={`container mx-auto p-4 shadow-md rounded-lg ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex items-center">
        <img
          src={user.profileImage || "/default-avatar.png"}
          alt={user.name}
          className="w-32 h-32 rounded-full mr-4"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">@{user.username}</p>
          {user.bio && <p className="mt-2">{user.bio}</p>}

          <button
            onClick={handleFollowToggle}
            className={`mt-4 px-4 py-2 rounded ${
              isFollowing ? "bg-red-500" : "bg-blue-500"
            } text-white`}
          >
            {(isFollowed && "Unfollow") ||
              (isRequested && "Requested") ||
              (!isFollowing ? "Follow" : "Follows you")}
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-around">
        <p className="text-sm">
          {user._count.followers} Follower
          {user._count.followers !== 1 ? "s" : ""}
        </p>
        <p className="text-sm">
          Following {user._count.followings} User
          {user._count.followings !== 1 ? "s" : ""}
        </p>
      </div>
      <br />
      <hr />
      <div className={`feed ${isDarkMode ? "dark" : ""}`}>
        {posts && posts.length
          ? posts.map((post) => (
              <Post
                key={post.id}
                {...post}
                onShare={() => handleShare(post.id)}
                isDarkMode={isDarkMode}
              />
            ))
          : ""}
      </div>
    </div>
  );
};

export default UserProfile;
