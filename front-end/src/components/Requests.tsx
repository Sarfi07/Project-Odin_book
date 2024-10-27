import { useEffect, useState } from "react";

interface ReqObj {
  id: string;
  requester_id: string;
  requester: { name: string; username: string };
}

interface Props {
  isDarkMode: boolean;
}

const Requests: React.FC<Props> = ({ isDarkMode }) => {
  const [requests, setRequests] = useState<ReqObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${backendUrl}/user/following/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch requests");

        const data = await res.json();
        setRequests(data); // Adjust based on your API response structure
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [backendUrl]);

  const handleAccept = async (requestId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${backendUrl}/user/following/accept/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to accept request");
      const data = await res.json();
      console.log(data);
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (requestId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${backendUrl}/user/following/decline/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to decline request");

      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <p className={`text-center ${isDarkMode ? "text-white" : "text-black"}`}>
        Loading...
      </p>
    );
  if (error)
    return (
      <p
        className={`text-center ${
          isDarkMode ? "text-red-400" : "text-red-600"
        }`}
      >
        Error: {error}
      </p>
    );

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } p-4 rounded-lg shadow-md`}
    >
      <h2
        className={`font-bold text-lg ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        Follow Requests
      </h2>
      {requests.length > 0 ? (
        requests.map((request) => (
          <div
            key={request.id}
            className={`flex items-center justify-between p-4 rounded-lg mb-2 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
            } shadow-md`}
          >
            <div>
              <p className="font-semibold">{request.requester.name}</p>
              <p className="text-gray-500">@{request.requester.username}</p>
            </div>
            <div>
              <button
                onClick={() => handleAccept(request.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(request.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        ))
      ) : (
        <p
          className={`text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          No requests found.
        </p>
      )}
    </div>
  );
};

export default Requests;
