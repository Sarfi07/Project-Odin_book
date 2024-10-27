import React, { useEffect, useState } from "react";
import { Person } from "../CustomTypes";
import { useNavigate } from "react-router-dom";
import Message from "../utils/Message";

interface FPprops {
  isDarkMode: boolean;
}

const FindPeople: React.FC<FPprops> = ({ isDarkMode }) => {
  const [peoples, setPeoples] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPeoples = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/user/people`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setError(response.statusText);
        }
        const data = await response.json();
        console.log(data);
        setPeoples(data.peoples);
      } catch (err) {
        console.error("Error fetching peoples:", err);
      }
    };

    fetchPeoples();
  }, []);

  const handleProfileClick = (person: Person) => {
    navigate(`/people/${person.id}`);
  };

  const filteredPeoples = peoples.filter((person) =>
    person.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <Message message={error} type="error" />;

  return (
    <div
      className={`container mx-auto p-4 rounded rounded-lg ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1 className="text-xl font-bold mb-4">Find People</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full p-2 mb-4 rounded-lg ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } border border-gray-300`}
      />

      <div className="grid grid-cols-1 gap-4">
        {filteredPeoples.length > 0 ? (
          filteredPeoples.map((person) => (
            <div
              key={person.username}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-md rounded-lg p-4 flex items-center text-center gap-4 cursor-pointer`}
              onClick={() => handleProfileClick(person)}
            >
              <img
                src={person.profileImage || "/default-avatar.png"}
                alt={person.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="mx-auto">
                <h2 className="font-semibold">{person.name}</h2>
                <p className="text-gray-500">@{person.username}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No people found.</p>
        )}
      </div>
    </div>
  );
};

export default FindPeople;
