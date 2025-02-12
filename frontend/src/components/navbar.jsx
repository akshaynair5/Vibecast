import React, { useContext, useState } from "react";
import { Authcontext } from "../contextProvider";
import logout from "../services/logout";
import SearchBar from "./search";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const {currentUser} = useContext(Authcontext)

  // Toggle functions - 
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <nav className="w-[100%] bg-black text-white z-10 pt-3 pb-2 bg-transparent"
      style={{
        backgroundImage: location.pathname === '/' 
          ? 'linear-gradient(to bottom, #242424, #1d1d1d, #161616, #0d0d0d, #000000)' 
          : 'none'
      }}
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              {/* <img
                className="h-8 w-auto"
                src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                alt="Your Company"
              /> */}
            </div>
            <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                    <Link
                        to="/Home"
                        className={`rounded-md px-2 py-2 text-sm font-medium ${
                        location.pathname === '/Home' ? ' text-white' : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        Home
                    </Link>

                    <div className="relative ml-10">
                        <SearchBar />
                    </div>
                </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span className="absolute -inset-1.5"></span>
              <span className="sr-only">View notifications</span>
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>

            <div className="relative ml-3">
                <button
                    type="button"
                    className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    id="user-menu-button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={toggleDropdown}
                >
                    <span className="sr-only">Open user menu</span>
                    <img
                    className="h-8 w-8 rounded-full"
                    src={`${currentUser.avatar}`}
                    alt="Profile"
                    />
                </button>
                {isOpen && (
                    <div
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                    style={{ 
                      backgroundImage: 'linear-gradient(to right bottom, #242424, #1d1d1d, #161616, #0d0d0d)'
                    }}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    >
                    <Link
                        to="/Profile"
                        className="block px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 p-2 rounded-md"
                        role="menuitem"
                        onClick={closeDropdown}
                    >
                        Your Profile
                    </Link>
                    <Link
                        to="/settings"
                        className="block px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 p-2 rounded-md"
                        role="menuitem"
                        onClick={closeDropdown}
                    >
                        Settings
                    </Link>
                    <a
                        href="#"
                        className="block px-4 py-3 text-sm text-gray-100 hover:bg-gray-800 p-2 rounded-md"
                        role="menuitem"
                        onClick={()=>{logout(currentUser); closeDropdown();}}
                    >
                        Sign out
                    </a>
                    </div>
                )}
                </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
                    <Link
                        to="/Home"
                        className={`block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white ${
                        location.pathname === '/Home' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/Profile"
                        className={`block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white ${
                        location.pathname === '/Profile' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        Profile
                    </Link>
                    <Link
                        to="/Explore"
                        className={`block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 ${
                        location.pathname === '/Explore' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        Explore
                    </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
