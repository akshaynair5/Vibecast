import axios from "axios"; // Make sure axios is imported
import { useContext } from "react";
import axiosInstance from "./axiosInstance";

const logout = async (user) => {
  try {
    const response = await axiosInstance.post("/users/logout", { user });

    // // Remove user data from local storage or session storage

    localStorage.removeItem("userData");  // If you store user info here

    window.location.href = "/Login";  // Redirect the user to the home page

  } catch (error) {
    console.error("Logout failed", error.response?.data?.message || error.message);
  }
};

export default logout;
