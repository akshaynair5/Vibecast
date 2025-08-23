import React, { useContext, useState } from "react";
import { Authcontext } from "../contextProvider";
import logout from "../services/logout";
import SearchBar from "./search";
import { Link, useLocation } from "react-router-dom";
import defaultAvatar from '../assets/default-avatar.jpg' 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useContext(Authcontext);
  const location = useLocation();

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  return (
    <nav
      className="w-full bg-transparent text-white z-10 pt-3 pb-2"
      style={{
        backgroundImage:
          location.pathname === "/"
            ? "linear-gradient(to bottom, #242424, #1d1d1d, #161616, #0d0d0d, #000000)"
            : "none",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <Link
              to="/Home"
              className={`rounded-md px-2 py-2 text-sm font-medium ${
                location.pathname === "/Home"
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Home
            </Link>

            <div className="ml-4">
              <SearchBar />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white 
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span className="sr-only">View notifications</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 
                  9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 
                  6.022c1.733.64 3.56 1.085 5.455 
                  1.31m5.714 0a24.255 24.255 0 0 
                  1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex rounded-full bg-gray-800 text-sm focus:outline-none 
                focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                onClick={toggleDropdown}
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full"
                  src={currentUser.avatar ? currentUser.avatar : defaultAvatar}
                  alt="Profile"
                />
              </button>

              {isOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black/5 z-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right bottom, #242424, #1d1d1d, #161616, #0d0d0d)",
                  }}
                >
                  <Link
                    to="/Profile"
                    className="block px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 rounded-md"
                    onClick={closeDropdown}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 rounded-md"
                    onClick={closeDropdown}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout(currentUser);
                      closeDropdown();
                    }}
                    className="block px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 rounded-md text-center w-full"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
