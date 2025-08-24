import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="h-screen w-screen fixed top-0 left-0 bg-gradient-to-b from-[#1e1e2f] via-[#141414] to-black flex flex-col">
      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white tracking-wide"
        >
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
        </motion.h1>

        {/* Buttons */}
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-full text-white text-sm border border-white/30 hover:border-pink-500 hover:text-pink-400 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-full bg-pink-600 text-white text-sm hover:bg-pink-500 transition"
          >
            Join Now
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-6">
        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-center items-center"
        >
          <div className="bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 p-10 rounded-full shadow-2xl">
            <Headphones className="w-28 h-28 md:w-40 md:h-40 text-white" />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center md:text-left mt-6 md:mt-0 md:ml-10 max-w-lg"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
            Share Your <span className="text-pink-500">Voice & Vibes</span>
          </h2>
          <p className="text-white/70 mt-3 text-sm md:text-base">
            Upload podcasts, share music, or go live and talk about what matters to you.  
            Subscribe to channels, join discussions, and discover a world of voices and sounds.  
          </p>
          <p className="text-white/70 mt-2 text-sm md:text-base">
            Build playlists mixing podcasts and music, leave comments, like others’ thoughts,  
            and connect with creators in real time.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
