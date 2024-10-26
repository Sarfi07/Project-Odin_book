import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { userObj } from "./CustomTypes";

interface ComponentProps {
  children: ReactNode;
  setUserInfo: React.Dispatch<React.SetStateAction<userObj | null>>;
}

const PrivateRoute = ({ children, setUserInfo }: ComponentProps) => {
  const [validUser, setValidUser] = useState<boolean | null>(null);

  const token = localStorage.getItem("token");

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
        const data = await res.json();
        setValidUser(data.success);
        const fetchUserInfo = async () => {
          const token = localStorage.getItem("token");

          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch user");
          }

          const data = await res.json();
          setUserInfo(data.user);
        };
        fetchUserInfo();
      } catch (err) {
        console.error("Error verifying token: ", err);
        setValidUser(false);
      }
    };
    verifyToken();
  }, [token, setUserInfo]);

  if (validUser === null) return <div>Loading...</div>;

  if (!validUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
