import React, { useState } from "react";
// import { SidebarProps } from "../CustomTypes";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState("");
  const pages = [
    "Home",
    "Create",
    "Connections",
    "Requests",
    "Find-People",
    "Conversations",
    "Profile",
  ];

  return (
    <aside className="flex-shrink-0 w-64 bg-gray-800 text-white" id={"sidebar"}>
      <div className={`p-4`}>
        <h2 className="text-lg font-bold mb-4">Sidebar</h2>
        <ul className="text-center cursor-pointer flex flex-col">
          {pages.map((page) => (
            <li
              key={page}
              className={`py-2 hover:font-bold transition duration-200 ${
                selectedPage === page
                  ? "bg-gray-700 font-bold rounded-md"
                  : "bg-transparent"
              }`}
              onClick={() => setSelectedPage(page)}
            >
              {page != "Home" ? (
                <Link to={`/${page.toLocaleLowerCase()}`}>{page}</Link>
              ) : (
                <Link to="/">{page}</Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
