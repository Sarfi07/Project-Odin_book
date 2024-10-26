import React from "react";
import { userObj } from "../CustomTypes";
import { Feed } from "../utils/Feed";
import FindPeople from "./FindPeople";

interface MContentProps {
  userInfo: userObj;
  selectedPage: string;
  isDarkMode: boolean;
}

const MainContent: React.FC<MContentProps> = ({
  userInfo,
  selectedPage,
  isDarkMode,
}) => {
  const containerClass = isDarkMode
    ? "bg-gray-900 text-white"
    : "bg-gray-100 text-black";

  switch (selectedPage) {
    case "Home":
      return (
        <main className={`flex-1 p-4 md:p-8 ${containerClass}`}>
          <h1 className="text-2xl font-bold mb-4">Welcome {userInfo.name}</h1>
          <Feed isDarkMode={isDarkMode} />
        </main>
      );

    case "Find People":
      return (
        <main className={`flex-1 p-4 md:p-8 ${containerClass}`}>
          <FindPeople isDarkMode={isDarkMode} />
        </main>
      );

    case "Chat":
      return (
        <main className={`flex-1 p-4 md:p-8 ${containerClass}`}>Chat</main>
      );

    case "Settings":
      return (
        <main className={`flex-1 p-4 md:p-8 ${containerClass}`}>Settings</main>
      );
  }
};

export default MainContent;
