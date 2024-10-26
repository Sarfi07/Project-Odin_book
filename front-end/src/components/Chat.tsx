import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5"; // Using an icon for the send button
import { Message as MessageType } from "./CustomTypes";
import Message from "./utils/Message";

interface ChatProps {
  isDarkMode: boolean;
}

interface Receiver {
  id: string;
  name: string;
  username: string;
}

const Chat: React.FC<ChatProps> = ({ isDarkMode }) => {
  const [receiver, setReceiver] = useState<Receiver | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const { receiverId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  const wss_backend_url = import.meta.env.VITE_WSS_BACKEND_URL;
  const token = localStorage.getItem("token");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      const ws = new WebSocket(`${wss_backend_url}`, token);
      setSocket(ws);

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };

      return () => {
        ws.close();
      };
    }
  }, [receiverId, token, wss_backend_url]);
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`${backend_url}/user/chat/${receiverId}`, {
        // bug: old messages not coming to the receiver chat window
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError(response.statusText);
      }

      const data = await response.json();
      setMessages(data.messages);
      if (!data.receiver) {
        setError("Unfortunately this user does not exists");
      }
      setReceiver(data.receiver);
    };

    fetchMessages();
  }, [backend_url, token, receiverId]);

  useEffect(() => {
    // Scroll to the bottom whenever new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      const messageData = {
        receiverId: receiverId,
        content: newMessage,
      };
      socket.send(JSON.stringify(messageData));
      setNewMessage("");
    }
  };

  if (error) {
    return <Message message={error} type="error" />;
  }

  return (
    <div
      className={`flex flex-col h-full max-h-screen p-4 rounded-lg shadow-lg ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Chat Header */}
      <div className="chat-header flex items-center justify-between p-4 border-b">
        <h2 className="text-md font-bold italic text-gray-400">
          Chat with{" "}
          {receiver ? `${receiver.name} (@${receiver.username})` : receiverId}
        </h2>
      </div>

      {/* Chat Messages */}
      <div className="chat-body flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender_id !== `${receiverId}`
                ? "self-end text-right"
                : "self-start text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg max-w-xs ${
                msg.sender_id !== `${receiverId}`
                  ? isDarkMode
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 text-blue-900"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {/* Dummy div for scrolling */}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Chat Input */}
      <div className="chat-input flex items-center p-4 border-t space-x-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className={`flex-1 p-2 rounded-lg border ${
            isDarkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-gray-100 text-gray-900 border-gray-300"
          }`}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <IoSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
