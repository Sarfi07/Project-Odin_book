import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("token", token);

      // Redirect to the dashboard or any protected route
      navigate("/");
    } else {
      // Handle the error if no token is found
      console.error("No token found in Url");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <h2>Processing OAuth Login...</h2>
    </div>
  );
};

export default OAuthCallback;
