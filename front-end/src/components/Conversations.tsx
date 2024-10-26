import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Message from "./utils/Message";

interface User {
  id: string;
  name: string;
  profileImage: string;
  username: string;
}

interface ConversationProps {
  isDarkMode: boolean;
}

const Conversation: React.FC<ConversationProps> = ({ isDarkMode }) => {
  const [conversations, setConversations] = useState<User[]>([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      const response = await fetch(`${backend_url}/user/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError(response.statusText);
      }
      const data = await response.json();
      setConversations(data.conversations);
    };

    fetchConnections();
  }, [backend_url, token]);

  // Function to handle when a user card is clicked
  const openChat = (user: User) => {
    navigate(`/chat/${user.id}`);
  };

  if (error) return <Message message={error} type="error" />;

  return (
    <div
      className={`container mx-auto p-4 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="grid gap-8 w-full">
        {/* Followers Section */}
        <div className="followers-section">
          <h3 className="text-xl font-semibold mb-4 italic my-2">
            Conversations
          </h3>
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center m-8 p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => openChat(conversation)}
              >
                <img
                  src={conversation.profileImage || "/default-avatar.png"}
                  alt={conversation.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <p className="font-semibold m-4">
                  {conversation.name} @{conversation.username}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
