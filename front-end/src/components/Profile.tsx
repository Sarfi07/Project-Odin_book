import React, { useEffect, useState } from "react";
import edit from "../assets/edit.svg";
import ProfileImageUpload from "./utils/ProfileImageUpload";
import Message from "./utils/Message";

interface ProfileProps {
  isDarkMode: boolean;
}

interface UserObj {
  id: string;
  profileImage: string;
  bio: string;
  name: string;
  username: string;
  followersCount: number;
  followingsCount: number;
}

const Profile: React.FC<ProfileProps> = ({ isDarkMode }) => {
  const [user, setUser] = useState<UserObj | null>(null);
  const [formData, setFormData] = useState<UserObj | null>(null);
  const [newPassword, setNewPassword] = useState<string>(""); // For password change
  const [oldPassword, setOldPassword] = useState("");
  const [isDailogOpen, setIsDailogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${backend_url}/user/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) setError(response.statusText);
        const data = await response.json();
        const fetchedUser = {
          ...data.user,
          followersCount: data.user._count.followers,
          followingsCount: data.user._count.followings,
        };
        setUser(fetchedUser);
        setFormData(fetchedUser); // Initialize form fields with user data
      } catch (err) {
        if (err instanceof Error) {
          console.error(err);
        }
      }
    };
    fetchUser();
  }, [backend_url, token]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    } as UserObj);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backend_url}/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Profile updated:", result);
      setMessage(result.message);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backend_url}/user/update/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const result = await response.json();
      console.log("Password updated:", result);
      setMessage(result.message);
      setNewPassword("");
      setOldPassword(""); // Clear password field after submission
    } catch (err) {
      console.error("Error updating password:", err);
    }
  };
  const handleImageUpload = async (image: File) => {
    const formData = new FormData();
    formData.append("profileImage", image); // 'profileImage' should match the key expected by your backend
    setMessage("");
    try {
      const response = await fetch(`${backend_url}/user/update/profileImage`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // No need to add Content-Type for FormData, the browser sets it automatically
        },
        body: formData,
      });

      const result = await response.json();

      setUser(result.updatedUser);
      setMessage(result.message);
    } catch (err) {
      if (err instanceof Error) console.error(err);
    }
  };

  if (error) return <Message message={error} type="error" />;

  return (
    <div
      className={`p-8 max-w-4xl mx-auto rounded ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black-900"
      }`}
      id="foo"
    >
      {message && <Message message={message} type="info" />}
      {user ? (
        <div
          className={`p-6 rounded-lg shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user.profileImage || "/default-profile.png"}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4"
            />
            <img
              src={edit}
              alt="Edit Profile Image"
              className="cursor-pointer"
              onClick={() => setIsDailogOpen(true)}
            />
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">@{user.username}</p>
            <p className="text-center mt-2">{user.bio}</p>
            <div className="flex justify-between space-x-6 mt-4">
              <span className="font-bold">
                Followers: {user.followersCount}
              </span>
              <span className="font-bold">
                Following: {user.followingsCount}
              </span>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-black">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={formData?.name || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-black"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Bio:
              </label>
              <textarea
                name="bio"
                value={formData?.bio || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-black"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Username:
              </label>
              <input
                type="text"
                name="username"
                value={formData?.username || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-black"
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handlePasswordSubmit}
            className="mt-6 space-y-4 text-black"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Old Password:
              </label>
              <input
                type="password"
                name="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-black"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password:
              </label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-black"
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600"
            >
              Change Password
            </button>
          </form>
        </div>
      ) : (
        <p className="text-center text-lg">Loading user data...</p>
      )}

      <ProfileImageUpload
        isOpen={isDailogOpen}
        onClose={() => setIsDailogOpen(false)}
        onUpload={handleImageUpload}
      />
    </div>
  );
};

export default Profile;
