import { useState, useRef } from "react";
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiEdit2,
  FiCamera,
  FiX,
  FiInfo,
  FiCheck,
} from "react-icons/fi";

const ProfileEditForm = ({ userProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    location: userProfile?.location || "",
    bio: userProfile?.bio || "",
    contact: userProfile?.contact || "",
    profilePicture: userProfile?.profilePicture || "",
  });
  const [previewImage, setPreviewImage] = useState(
    userProfile?.profilePicture || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError("Only JPG, PNG, or GIF images are allowed");
      return;
    }

    if (file.size > maxSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${import.meta.env.VITE_API_BASE_URL}/users/upload-profile-picture`,
        true
      );
      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${localStorage.getItem("token")}`
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFormData((prev) => ({
            ...prev,
            profilePicture: response.pictureUrl,
          }));
        } else {
          throw new Error(xhr.statusText);
        }
      };

      xhr.onerror = () => {
        throw new Error("Network error");
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
      setPreviewImage(userProfile?.profilePicture || "");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bio: formData.bio,
            contact: formData.contact,
            location: formData.location,
            picture: formData.profilePicture,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      onSave(data.user);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 transition duration-200"
              disabled={isUploading}
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <FiInfo className="flex-shrink-0 mt-1 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full border-4 border-green-100 overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={previewImage || "https://via.placeholder.com/150"}
                      alt="Profile preview"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition duration-200"
                    disabled={isUploading}
                  >
                    <FiCamera className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center p-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">
                        {uploadProgress}% Uploaded
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                    <FiUser className="text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {formData.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <FiInfo className="inline mr-1" />
                    Contact support to change your name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                    <FiMail className="text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {formData.email}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your location"
                      maxLength="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Tell us about yourself and your farming experience..."
                  maxLength="500"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    <FiInfo className="inline mr-1" />
                    Share your farming background and interests
                  </p>
                  <span
                    className={`text-xs ${
                      formData.bio.length >= 500
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.bio.length}/500
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Information
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Phone number or alternative contact"
                  maxLength="50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <FiInfo className="inline mr-1" />
                  This will be visible to other community members
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50 flex items-center"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;
