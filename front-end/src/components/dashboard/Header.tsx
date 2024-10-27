import React from "react";
import { userObj } from "../CustomTypes";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

interface HeaderProps {
  userInfo: userObj | null;
  onMenuClick: () => void;
  onThemeToggle: () => void; // New prop for toggling theme
  darkMode: boolean; // Pass the current mode to display the correct icon
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  userInfo,
  onThemeToggle,
  darkMode,
}) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md p-2 flex justify-between items-center">
      {/* Hamburger menu for mobile */}
      <button className="md:hidden focus:outline-none" onClick={onMenuClick}>
        <svg
          className="h-6 w-6 text-gray-600 dark:text-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div
        onClick={() => navigate("/", { replace: true })}
        className="flex text-xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
      >
        <img
          className="w-8 rounded rounded-full mr-2"
          src={logo}
          alt="Social Beings"
        />
        Social Beings
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme toggle button */}
        <button onClick={onThemeToggle} className="focus:outline-none">
          {darkMode ? (
            <svg
              className="h-6 w-6 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m8.485-8.485l.707-.707M4.222 4.222l-.707.707M20 12h1m-17 0H3m16.071 7.071l.707.707M4.222 19.778l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-gray-600 dark:text-gray-200"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3c3.866 0 7 3.134 7 7s-3.134 7-7 7S5 13.866 5 10 8.134 3 12 3zm0 0v1m0 16v1m8.485-8.485l.707-.707M4.222 4.222l-.707.707M20 12h1m-17 0H3m16.071 7.071l.707.707M4.222 19.778l-.707-.707"
              />
            </svg>
          )}
        </button>

        {/* Profile picture */}
        <img
          className="h-14 w-14 rounded-full cursor-pointer"
          src={userInfo ? userInfo.profileImage : "#"}
          alt="Profile"
          onClick={() => navigate("/profile", { replace: true })}
        />
      </div>
    </header>
  );
};

export default Header;
