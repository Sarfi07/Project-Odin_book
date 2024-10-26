import React, { useEffect, useState } from "react";
import messageIcon from "../assets/messageIcon.svg";
import { useNavigate } from "react-router-dom";
interface FollowersType {
  id: string;
  follower: {
    id: string;
    profileImage: string;
    name: string;
    username: string;
  };
}

interface FollowingsType {
  id: string;
  following: {
    id: string;
    profileImage: string;
    name: string;
    username: string;
  };
}

interface ConnectionsProps {
  isDarkMode: boolean;
}

const Connections: React.FC<ConnectionsProps> = ({ isDarkMode }) => {
  const [following, setFollowing] = useState<FollowingsType[]>([]);
  const [followers, setFollowers] = useState<FollowersType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchConnections = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${backendUrl}/user/connections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch connections");

        const data = await response.json();
        setFollowing(data.followings);
        setFollowers(data.followers);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [backendUrl]);

  const handleChatClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className={`grid w-full gap-16 ${
        isDarkMode ? "bg-gray-800" : "bg-gray-100"
      } p-4`}
    >
      <div
        className={`w-1/2 p-4 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        } shadow-md rounded-lg m-auto w-full`}
      >
        <h2 className="text-xl font-bold mb-2">Following</h2>
        {following && following.length > 0 ? (
          following.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between mb-2 cursor-pointer gap-2 my-4 border border-solid border-indigo-500/100  rounded p-4 hover:bg-black"
            >
              <div
                className="flex justify-around w-3/4"
                onClick={() => navigate(`/people/${user.following.id}`)}
              >
                <img
                  src={user.following.profileImage || "/default-avatar.png"}
                  alt={user.following.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <p className="font-semibold">
                  {user.following.name} {user.following.username}
                </p>
              </div>
              <img
                onClick={() => handleChatClick(user.following.id)}
                src={messageIcon}
                alt={`Message ${user.following.name}`}
              />
            </div>
          ))
        ) : (
          <p>No following users found.</p>
        )}
      </div>

      <div
        className={`w-1/2 p-4 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        } shadow-md rounded-lg m-auto w-full`}
      >
        <h2 className="text-xl font-bold mb-2">Followers</h2>
        {followers && followers.length > 0 ? (
          followers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between mb-2 cursor-pointer gap-2 my-4 border border-solid border-indigo-500/100  rounded p-4 hover:bg-black"
            >
              <div
                className="flex justify-between w-3/4"
                onClick={() => navigate(`/people/${user.follower.id}`)}
              >
                <img
                  src={user.follower.profileImage || "/default-avatar.png"}
                  alt={user.follower.name}
                  className="w-10 h-10 rounded-full mr-2 border"
                />
                <p className="font-semibold">
                  {user.follower.name} {user.follower.username}
                </p>
              </div>
              <img
                onClick={() => handleChatClick(user.follower.id)}
                src={messageIcon}
                alt={`Message ${user.follower.name}`}
              />
            </div>
          ))
        ) : (
          <p>No followers found.</p>
        )}
      </div>
    </div>
  );
};

export default Connections;
