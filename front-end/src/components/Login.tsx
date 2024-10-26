import { useState } from "react";
import { useNavigate } from "react-router-dom";
import githubIcon from "../assets/githubIcon.svg";
import googleIcon from "../assets/googleIcon.svg";
import { userObj } from "./CustomTypes";

interface loginProps {
  setUserInfo: React.Dispatch<React.SetStateAction<userObj | null>>;
}

const Login: React.FC<loginProps> = ({ setUserInfo }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const back_end_url = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // todo
      const res = await fetch(`${back_end_url}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("token", result.token);
        setMessage("Login successful!");
        setUserInfo(result.userObj);
        navigate("/");
      } else {
        setMessage("Login failed: " + result.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setMessage("An error ocurred: " + err.message);
      } else {
        setMessage("An unknown error is occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  const handleGuestSignIn = async () => {
    try {
      const response = await fetch(`${back_end_url}/auth/guest-signin`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 flex justify-center">
          Log in to you account
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-gray-500" : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? "Logging you in..." : "Login"}
          </button>

          {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
        </form>

        <div className="mt-6 flex justify-center space-x-4">
          <a
            href={`${back_end_url}/auth/github`}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <img
              src={githubIcon}
              alt="Github Login"
              className="h-16 w-16 mr-2"
            />
            Continue with GitHub
          </a>
          <a
            href={`${back_end_url}/auth/google`}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <img
              src={googleIcon}
              alt="Google Login"
              className="h-16 w-16 mr-2"
            />
            Continue with Google
          </a>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSignupRedirect}
            className="text-indigo-600 hover:text-indigo-500 text-sm"
          >
            Sign up instead
          </button>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleGuestSignIn}
            className="text-indigo-600 hover:text-indigo-500 text-sm"
          >
            Guest Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
