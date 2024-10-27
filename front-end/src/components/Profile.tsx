import React, { useEffect, useState } from "react";
import edit from "../assets/edit.svg";
import ProfileImageUpload from "./utils/ProfileImageUpload";
import Message from "./utils/Message";
import EditForm from "./utils/ProfileEditForm";
import { PostType } from "./CustomTypes";
import Post from "./utils/Post";
import handleShare from "./utils/handleShare";

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
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${backend_url}/user`, {
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
        setPosts(data.posts);
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

  const handleProfileEditOpen = () => {
    setEditFormOpen(!editFormOpen);
  };

  if (error) return <Message message={error} type="error" />;

  return (
    <div
      className={`p-8 max-w-4xl mx-auto rounded ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black-900"
      }`}
      id="foo"
    >
      {linkCopied && <Message message="Link copied" type="info" />}
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
          <button
            className="bg-blue-700 p-2.5 px-3 rounded rounded-lg hover:bg-blue-900"
            onClick={handleProfileEditOpen}
          >
            Edit Your Profile
          </button>
          {editFormOpen && (
            <EditForm
              handleChange={handleChange}
              handlePasswordSubmit={handlePasswordSubmit}
              handleSubmit={handleSubmit}
              setNewPassword={setNewPassword}
              setOldPassword={setOldPassword}
              newPassword={newPassword}
              oldPassword={oldPassword}
              formData={formData}
              isDarkMode={isDarkMode}
            />
          )}

          {posts && (
            <div className="mt-4">
              <hr />
              <br />
              <h2 className="text-center font-bold text-lg underline italic mb-4">
                You Posts
              </h2>

              {posts.length
                ? posts.map((post) => (
                    <Post
                      key={post.id}
                      {...post}
                      onShare={() =>
                        handleShare({ postId: post.id, setLinkCopied })
                      }
                      isDarkMode={isDarkMode}
                    />
                  ))
                : "No posts found"}
            </div>
          )}
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
