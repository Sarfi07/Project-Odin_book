import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./dashboard/Sidebar";
import Header from "./dashboard/Header";
import { userObj } from "./CustomTypes";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserPlus,
  FaSearch,
  FaComments,
  FaUser,
  FaUserFriends,
} from "react-icons/fa";
import { MdCreate } from "react-icons/md";

interface DashboardProps {
  userInfo: userObj | null;
  handleThemeToggle: () => void;
  darkMode: boolean;
  children: ReactNode;
  setUserInfo: React.Dispatch<React.SetStateAction<userObj | null>>;
}

const DashboardLayout: React.FC<DashboardProps> = ({
  userInfo,
  darkMode,
  children,
  handleThemeToggle,
  setUserInfo,
}) => {
  const [validUser, setValidUser] = useState<boolean | null>(null);
  const [selectedPage, setSelectedPage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  }
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setValidUser(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/verifyToken`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!res.ok) {
          navigate("/login");
        }
        const data = await res.json();
        setValidUser(data.success);

        if (data.success) {
          const fetchUserInfo = async () => {
            const token = localStorage.getItem("token");

            const res = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/user`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!res.ok) {
              throw new Error("Failed to fetch user");
            }

            const data = await res.json();
            setUserInfo(data.user);
          };
          fetchUserInfo();
        }
      } catch (err) {
        console.error("Error verifying token: ", err);
        setValidUser(false);
      }
    };
    verifyToken();
  }, [token, setUserInfo, navigate]);

  if (validUser === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container flex flex-col min-h-screen">
      <Header
        userInfo={userInfo}
        onThemeToggle={handleThemeToggle}
        darkMode={darkMode}
      />

      <div className="flex flex-grow">
        {/* Sidebar for larger screens */}
        <div className="hidden md:flex md:w-64">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="main-content flex-grow">{children}</div>
      </div>

      {/* Bottom Navigation for mobile */}
      <div className="md:hidden fixed inset-x-0 bottom-0 bg-gray-800 text-white flex justify-around items-center py-2 z-50">
        <button
          onClick={() => {
            setSelectedPage("create");
            navigate("/create");
          }}
        >
          <MdCreate
            className={selectedPage === "create" ? "h-12 w-12" : "h-6 w-6"}
          />
        </button>
        <button
          onClick={() => {
            setSelectedPage("connections");
            navigate("/connections");
          }}
        >
          <FaUserFriends
            className={selectedPage === "connections" ? "h-12 w-12" : "h-6 w-6"}
          />
        </button>

        <button
          onClick={() => {
            setSelectedPage("requests");
            navigate("/requests");
          }}
        >
          <FaUserPlus
            className={selectedPage === "requests" ? "h-12 w-12" : "h-6 w-6"}
          />
        </button>

        <button
          onClick={() => {
            setSelectedPage("");
            navigate("/");
          }}
        >
          <FaHome className={selectedPage === "" ? "h-12 w-12" : "h-6 w-6"} />
        </button>

        <button
          onClick={() => {
            setSelectedPage("find-people");
            navigate("/find-people");
          }}
        >
          <FaSearch
            className={selectedPage === "find-people" ? "h-12 w-12" : "h-6 w-6"}
          />
        </button>
        <button
          onClick={() => {
            setSelectedPage("conversations");
            navigate("/conversations");
          }}
        >
          <FaComments
            className={
              selectedPage === "conversations" ? "h-12 w-12" : "h-6 w-6"
            }
          />
        </button>
        <button
          onClick={() => {
            setSelectedPage("profile");
            navigate("/profile");
          }}
        >
          <FaUser
            className={selectedPage === "profile" ? "h-12 w-12" : "h-6 w-6"}
          />
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;
