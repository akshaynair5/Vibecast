import { useContext, useEffect, useState } from "react";
import { Authcontext } from "../contextProvider";
import Navbar from "../components/navbar";
import axiosInstance from "../services/axiosInstance";
import axios from "axios";

export default function SettingsPage() {
  const { currentUser, setCurrentUser } = useContext(Authcontext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    description: "",
  });

  useEffect(() => {
    if (currentUser && currentUser._id) {
      setFormData((prev) => ({
        ...prev,
        username: currentUser.username || "",
        email: currentUser.email || "",
        fullName: currentUser.fullName || "",
        description: currentUser.description || "",
      }));
    }
  }, [currentUser]);

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [showSaveButton, setShowSaveButton] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");  // For the old password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleChange = (e) => {
    setTempValue(e.target.value);
    setShowSaveButton(true);
  };

  const handleSave = async () => {
    if (editingField) {
      setFormData({ ...formData, [editingField]: tempValue });
      setEditingField(null);
      setShowSaveButton(false);

      try {
        // Assuming the backend is set up with a `/api/update-user-details` endpoint
        const response = await axiosInstance.patch("/users/update-user-details", formData);

        if (response.ok) {
          console.log("User details updated successfully");
        } else {
          console.error("Error updating details:", data.message || "Error");
        }
      } catch (error) {
        console.error("An error occurred while updating details:", error);
      }
    }
  };

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const handleChangePassword = async () => {
    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      // Assuming the backend is set up with a `/api/change-password` endpoint
      const response = await axiosInstance.post("/users/change-password", {
          currentPassword,  // Send the current password (old password)
          newPassword: password,  // Send the new password
        }
      );

      const data = await response.data;

      if (response.status === 200) {
        console.log("Password updated successfully");
        setIsChangingPassword(false);
        setPreviousPassword("");
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
        setPasswordError("");
      } else {
        setPasswordError(data.message || "Error updating password");
      }
    } catch (error) {
      setPasswordError("An error occurred. Please try again.");
    }
  };

  return (
<div
  className="min-h-screen justify-items-center items-start text-white p-6 fixed top-0 left-0 right-0 bottom-0 overflow-y-scroll"
  style={{
    backgroundImage: 'linear-gradient(to bottom, #515151, #3d3d3d, #2a2a2a, #191919, #000000)',
  }}
>
  <Navbar />
  <div className="w-full lg:w-[75vw] mt-10 bg-transparent p-6 rounded-lg shadow-2xl backdrop-blur-md border border-gray-600">
    <h1 className="text-3xl font-semibold mb-6 text-center">User Settings</h1>
    <div className="space-y-4">
      {Object.keys(formData).map((key) => (
        <div
          key={key}
          className="flex justify-between p-3 bg-gray-700 bg-opacity-70 rounded-md cursor-pointer hover:bg-opacity-80 transition"
          onClick={() => handleEdit(key, formData[key])}
        >
          <div>
            <p className="text-gray-300 capitalize text-left">{key.replace(/([A-Z])/g, " $1")}</p>
            {editingField === key ? (
              <textarea
                value={tempValue}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 mt-1 bg-transparent text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                autoFocus
              />
            ) : (
              <p className="text-lg">{formData[key]}</p>
            )}
          </div>
        </div>
      ))}

      {/* Change Password Section */}
      <div
        className="flex justify-between items-center p-3 bg-gray-700 bg-opacity-70 rounded-md cursor-pointer hover:bg-opacity-80 transition"
        onClick={() => setIsChangingPassword(true)}
      >
        <p className="text-gray-400">Change Password</p>
        <p className="text-lg">********</p>
      </div>

      {isChangingPassword && (
        <div className="p-3 bg-gray-700 bg-opacity-70 rounded-md mt-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordError("");
            }}
            className="w-full p-2 mb-2 bg-transparent text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            className="w-full p-2 mb-2 bg-transparent text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError("");
            }}
            className="w-full p-2 mb-2 bg-transparent text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => setIsChangingPassword(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
            >
              Save Password
            </button>
          </div>
        </div>
      )}
    </div>

    {showSaveButton && (
      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition"
        >
          Save Changes
        </button>
      </div>
    )}
  </div>
</div>

  );
}
