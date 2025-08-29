import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Authcontext } from "../contextProvider";
import axiosInstance from "../services/axiosInstance";

const Login = () => {
  const clientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const {currentUser, setCurrentUser} = useContext(Authcontext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email && !formData.username) {
      newErrors.email = "Email or Username is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post("/users/login", formData);

      setSuccessMessage("Login successful!");
      setErrors({});
      setFormData({
        email: "",
        username: "",
        password: "",
      });
      localStorage.setItem("userData", JSON.stringify(response.data.message.user));
      setCurrentUser(response.data?.message.user);
      navigate("/Home")
    } catch (error) {
      console.log(error);
      const errorMsg =
        error.response?.data?.message || "An error occurred. Please try again.";
      setErrors({ form: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithGoogle = () => {
    /* global google */
    setLoading(true);
    if (!clientId) {
      console.error("Google client ID not found");
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const token = response.credential; // <-- Google ID Token

          const res = await axiosInstance.post(
            "/users/google", 
            { token },
            { withCredentials: true } // send/receive cookies
          );

          localStorage.setItem("userData", JSON.stringify(res.data.message.user));
          setCurrentUser(res.data.message.user);

          navigate("/Home");
        } catch (err) {
          console.error("Google login error:", err);
          setErrors({
            form: err.response?.data?.message || "Google login failed",
          });
        }
      },
    });
    setLoading(false);
    // Trigger the Google One Tap popup
    google.accounts.id.prompt();
  };

return (
  <div className="h-[100vh] w-[100vw] fixed left-0 top-0 bg-gradient-to-b from-[#0b0b0b] via-[#121212] to-black flex items-center justify-center p-4">
    {/* Subtle background grid/noise overlay (optional, purely visual) */}
    <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.035),transparent_25%),radial-gradient(circle_at_0%_80%,rgba(255,255,255,0.03),transparent_25%)]"></div>

    {/* Card */}
    <div className="relative w-full max-w-md">
      {/* Glow ring */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-indigo-500/30 via-fuchsia-500/20 to-emerald-500/20 blur opacity-60"></div>

      <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center mb-6">
          {/* Simple “VibeCast” mark */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-emerald-500 flex items-center justify-center shadow">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white">
                <path
                  d="M5 17c2.5-2 5.5-2 9 0m-10-4c3.5-3 9.5-3 14 0M5 9c4-3 10-3 14 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points="10,8 16,12 10,16"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">
              Vibe<span className="text-indigo-400">Cast</span>
            </span>
          </div>
        </div>

        <h2 className="text-xl font-medium text-white/90 text-center mb-6">
          Welcome back
        </h2>

        {/* Messages */}
        {successMessage && (
          <p className="text-emerald-400 text-center mb-4">{successMessage}</p>
        )}
        {errors.form && (
          <p className="text-red-400 text-center mb-4">{errors.form}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
              placeholder="yourhandle"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium text-white tracking-wide transition
              bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-emerald-600
              hover:from-indigo-500 hover:via-fuchsia-500 hover:to-emerald-500
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-black
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          
            <p className="text-center text-sm text-white/60 mt-4">
              Do not have an account?{" "}
              <Link
                to="/register"
                className="text-pink-400 hover:text-pink-300 underline transition"
              >
                Register here
              </Link>
            </p>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-2 text-xs text-white/40">or</span>
            </div>
          </div>

          {/* (Optional) Placeholder social row — non-functional, just visual */}
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2.5 text-white/80 hover:bg-white/10 transition"
              onClick = {() => {handleContinueWithGoogle()}}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M21.35 11.1h-9.18v2.92h5.33c-.24 1.5-1.6 4.4-5.33 4.4-3.22 0-5.85-2.66-5.85-5.94 0-3.28 2.63-5.94 5.85-5.94 1.84 0 3.06.77 3.77 1.43l2.57-2.48C16.82 3.5 14.78 2.6 12.17 2.6 6.97 2.6 2.78 6.83 2.78 12s4.19 9.4 9.39 9.4c5.43 0 9.02-3.82 9.02-9.2 0-.62-.07-1.08-.16-1.6z" />
              </svg>
              <span className="text-sm">Continue</span>
            </button>
            {/* <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5 text-white/80 hover:bg-white/10 transition"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M10 20v-6H7v-3h3V8.5C10 5.74 11.72 4 14.86 4c1.27 0 2.17.1 2.5.14v2.9H16c-1.4 0-1.67.67-1.67 1.65V11h3.2l-.42 3h-2.78v6H10z" />
              </svg>
              <span className="text-sm">Continue</span>
            </button> */}
          </div>
        </form>
      </div>
    </div>
  </div>
);

};

export default Login;
