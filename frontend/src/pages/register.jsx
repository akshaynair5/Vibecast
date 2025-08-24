import { useContext, useState } from "react";
import { Authcontext } from "../contextProvider";
import axiosInstance from "../services/axiosInstance";
import { Link } from "react-router-dom";
import { set } from "date-fns";

const Register = () => {
  const clientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID
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
  const [userNameError, setUserNameError] = useState(false);
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

    setUserNameError(false);
    if (!validateForm()) return;

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataObj.append(key, formData[key]);
      }
    });

    try {
      setLoading(true);
      const checkUserName = await axiosInstance.post('/users/check', updateData);

      if(checkUserName.data.data.isAvailable === false && updateData.username !== currentUser.username){
        setUserNameError(true);
        return;
      }
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

  const handleContinueWithGoogle = () => {
    /* global google */
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

          console.log("Google login success:", res.data);

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

    // Trigger the Google One Tap popup
    google.accounts.id.prompt();
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
                className={`w-full rounded-lg bg-white/5 border ${userNameError ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/40 p-3 outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-500/60`}
                placeholder="@yourhandle"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">{errors.username}</p>
              )}
              {userNameError && (
                <p className="mt-1 text-sm text-red-500">This username is already taken</p>
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
            <div className="grid grid-cols-2 gap-3">
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
            </div>


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
