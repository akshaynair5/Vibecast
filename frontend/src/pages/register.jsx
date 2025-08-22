import React, { useContext, useState } from "react";
import axios from "axios";
import { Authcontext } from "../contextProvider";
import axiosInstance from "../services/axiosInstance";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    username: "",
    avatar: null,
    coverImage: null,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const {currentUser, setCurrentUser} = useContext(Authcontext);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.avatar) newErrors.avatar = "Avatar is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataObj.append(key, formData[key]);
      }
    });

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/users/register",
        formDataObj,
      );
      setSuccessMessage(response.data.message);
      setErrors({});
      setFormData({
        fullName: "",
        email: "",
        password: "",
        username: "",
        avatar: null,
        coverImage: null,
      });
      localStorage.setItem("userData", JSON.stringify(response.data.message.user));
      setCurrentUser(response.data.message.user);
      navigate("/Home")
    } catch (error) {
      setErrors({
        form: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen w-[100vw] absolute top-0 left-0 bg-gradient-to-b from-[#111827] via-[#0f0f0f] to-black flex items-center justify-center overflow-y-scroll overflow-x-hidden">
    {/* Subtle overlay */}
    <div className="overflow-hiddenpointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.035),transparent_25%),radial-gradient(circle_at_0%_80%,rgba(255,255,255,0.03),transparent_25%)]"></div>

    {/* Split container */}
    <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* Branding */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 text-center px-6 py-10 md:px-8 relative">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-xl">
              <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-8 md:w-8 text-white">
                <path
                  d="M5 17c2.5-2 5.5-2 9 0m-10-4c3.5-3 9.5-3 14 0M5 9c4-3 10-3 14 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Vibe<span className="text-pink-400">Cast</span>
          </h1>
          <p className="text-white/70 max-w-sm mx-auto text-sm md:text-base">
            Join the community. Share playlists, discover vibes, and connect
            through music.
          </p>
        </div>
      </div>

      {/* Register card */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 sm:px-6 md:px-12 py-8 relative">
        {/* Glow ring */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-pink-500/30 via-purple-500/20 to-indigo-500/20 blur opacity-60"></div>

        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-medium text-white/90 text-center mb-6">
            Create your account
          </h2>

          {/* Success / Error Messages */}
          {successMessage && (
            <p className="text-emerald-400 text-center mb-4">{successMessage}</p>
          )}
          {errors.form && (
            <p className="text-red-400 text-center mb-4">{errors.form}</p>
          )}

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-500/60"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-500/60"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-500/60"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-500/60"
                placeholder="@yourhandle"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Avatar + Cover */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1">Avatar</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-2 
                             file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-pink-600 file:text-white 
                             hover:file:bg-pink-500 cursor-pointer"
                />
                {errors.avatar && (
                  <p className="text-red-400 text-xs mt-1">{errors.avatar}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm text-white/70 mb-1">
                  Cover Image (Optional)
                </label>
                <input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-2 
                             file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-pink-600 file:text-white 
                             hover:file:bg-pink-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white tracking-wide transition
                bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600
                hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 focus:ring-offset-black
                ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Link to login */}
            <p className="text-center text-sm text-white/60 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-pink-400 hover:text-pink-300 underline transition"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
);

};

export default Register;
