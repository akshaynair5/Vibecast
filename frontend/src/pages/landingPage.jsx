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
          Vibe<span className="text-pink-500">Cast</span>
        </motion.h1>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm rounded-xl bg-white/10 text-white border border-white/20 hover:bg-pink-600 hover:border-pink-500 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm rounded-xl bg-pink-600 text-white hover:bg-pink-500 transition"
          >
            Register
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
            Dive Into the <span className="text-pink-500">World of Music</span>
          </h2>
          <p className="text-white/70 mt-3 text-sm md:text-base">
            Explore, share, and enjoy endless music. Join our community to
            experience a whole new way of connecting with sound.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
