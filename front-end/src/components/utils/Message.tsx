import React from "react";

interface MessageProps {
  message: string;
  type: "success" | "error" | "info";
}

const Message: React.FC<MessageProps> = ({ message, type }) => {
  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-400 text-green-700";
      case "error":
        return "bg-red-100 border-red-400 text-red-700";
      case "info":
        return "bg-blue-100 border-blue-400 text-blue-700";
      default:
        return "";
    }
  };

  return (
    <div
      className={`border-l-4 p-4 mb-4 rounded ${getTypeClass()}`}
      role="alert"
    >
      <p>{message}</p>
    </div>
  );
};

export default Message;
