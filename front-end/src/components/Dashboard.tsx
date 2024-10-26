import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./dashboard/Sidebar";
import Header from "./dashboard/Header";
import { userObj } from "./CustomTypes";
import { useNavigate } from "react-router-dom";
// import { Navigate } from "react-router-dom";

interface DashboardProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo: userObj | null;
  handleThemeToggle: () => void;
  darkMode: boolean;
  sidebarOpen: boolean;
  children: ReactNode;
  setUserInfo: React.Dispatch<React.SetStateAction<userObj | null>>;
}

const DashboardLayout: React.FC<DashboardProps> = ({
  setSidebarOpen,
  userInfo,
  darkMode,
  sidebarOpen,
  children,
  handleThemeToggle,
  setUserInfo,
}) => {
  const [validUser, setValidUser] = useState<boolean | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setValidUser(false);
        return;
      }

      try {
        // todo
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
  }, [token, setUserInfo]);

  if (validUser === null) {
    return <div>Loaidng...</div>;
  }

  return (
    <div className="app-container">
      {/* Header and Sidebar Layout */}
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        userInfo={userInfo}
        onThemeToggle={handleThemeToggle}
        darkMode={darkMode}
      />

      <div className="sidebar-container">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(!sidebarOpen)} // Close sidebar when clicking outside
            ></div>

            {/* Sidebar for mobile */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Sidebar for larger screens */}
        <div className="hidden md:flex md:w-64">
          <Sidebar />
        </div>
      </div>
      {/* Main Content Area */}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default DashboardLayout;
