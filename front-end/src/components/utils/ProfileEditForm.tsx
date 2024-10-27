interface UserObj {
  id: string;
  profileImage: string;
  bio: string;
  name: string;
  username: string;
  followersCount: number;
  followingsCount: number;
}

interface EditFormProps {
  handleSubmit: React.FormEventHandler;
  handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  handlePasswordSubmit: (e: React.FormEvent) => Promise<void>;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setOldPassword: React.Dispatch<React.SetStateAction<string>>;
  formData: UserObj | null;
  isDarkMode: boolean;
  oldPassword: string;
  newPassword: string;
}

const EditForm: React.FC<EditFormProps> = ({
  handleChange,
  handlePasswordSubmit,
  handleSubmit,
  setNewPassword,
  setOldPassword,
  formData,
  isDarkMode,
  oldPassword,
  newPassword,
}) => {
  return (
    <div id="editFormContainer" className="pt-4">
      {/* Edit Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
          <label
            className={`block text-sm font-medium mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Name:
          </label>
          <input
            type="text"
            name="name"
            value={formData?.name || ""}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Bio:
          </label>
          <textarea
            name="bio"
            value={formData?.bio || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username:</label>
          <input
            type="text"
            name="username"
            value={formData?.username || ""}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
            }`}
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>

      {/* Change Password Form */}
      <form
        onSubmit={handlePasswordSubmit}
        className="mt-6 space-y-4 text-black"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Old Password:
          </label>
          <input
            type="password"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            New Password:
          </label>
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className={`w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
            }`}
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default EditForm;
