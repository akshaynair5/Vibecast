import axios from "axios"; // Make sure axios is imported
import { useContext } from "react";

const logout = async (user) => {
  try {
    // Make a request to the backend to log the user out
    const response = await axios.post("http://localhost:5000/api/v1/users/logout", {user}, { withCredentials: true });

    // If the response is successful, clear any local storage or session data
    console.log(response.data.message);  // Optionally log the success message

    // // Remove user data from local storage or session storage

    localStorage.removeItem("userData");  // If you store user info here

    window.location.href = "/Login";  // Redirect the user to the home page

  } catch (error) {
    console.error("Logout failed", error.response?.data?.message || error.message);
  }
};

export default logout;
