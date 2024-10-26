import React, { useState } from "react";

interface ProfileImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file)); // Preview image
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImage) {
      onUpload(selectedImage);
      onClose(); // Close dialog on successful upload
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Upload Profile Image</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Choose an image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
            />
          </div>

          {preview && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Image Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
