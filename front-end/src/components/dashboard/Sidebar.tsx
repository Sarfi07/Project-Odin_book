import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaUserPlus,
  FaSearch,
  FaComments,
  FaUser,
} from "react-icons/fa";
import { MdCreate } from "react-icons/md";

const Sidebar: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState("Home");

  const pages = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Create", path: "/create", icon: <MdCreate /> },
    { name: "Connections", path: "/connections", icon: <FaUserFriends /> },
    { name: "Requests", path: "/requests", icon: <FaUserPlus /> },
    { name: "Find-People", path: "/find-people", icon: <FaSearch /> },
    { name: "Conversations", path: "/conversations", icon: <FaComments /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
  ];

  return (
    <>
      {/* Sidebar for Larger Screens */}
      <aside
        className="hidden md:flex flex-shrink-0 w-64 bg-gray-800 text-white overflow-y-hidden"
        id="sidebar"
      >
        <div className="p-10">
          <ul className="flex flex-col space-y-3">
            {pages.map((page) => (
              <li
                key={page.name}
                className={`grid grid-cols-[auto_1fr] items-center gap-3 py-2 px-3 rounded-md transition duration-200 ${
                  selectedPage === page.name
                    ? "bg-gray-700 font-bold"
                    : "hover:bg-gray-700 hover:font-semibold"
                }`}
                onClick={() => setSelectedPage(page.name)}
              >
                <span className="text-lg">{page.icon}</span>
                <Link to={page.path} className="text-sm">
                  {page.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
