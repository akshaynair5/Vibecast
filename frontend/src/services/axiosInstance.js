import axios from "axios";
import logout from "./logout.jsx";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_URL}/api/v1`,
  withCredentials: true,  // Ensure cookies are sent with each request
});

// Request interceptor to add the access token to the headers
axiosInstance.interceptors.request.use(
  (config) => {
    // If you need to add headers or handle access token, you can do it here.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired tokens
axiosInstance.interceptors.response.use(
  (response) => response,  // If the response is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired access token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the access token using the refresh token
        const response = await axiosInstance.post("/users/refresh-token", {
          refreshToken: getCookie("refreshToken"),  // Assume you have a function to get cookies
        });

        // Save the new access token and refresh token to cookies
        const { accessToken, refreshToken } = response.data.data;
        setCookie("accessToken", accessToken);
        setCookie("refreshToken", refreshToken);

        // Retry the original request with the new access token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Refresh token failed", err);
        logout();
      }
    }

    // If the error isn't about token expiry, reject it as usual
    return Promise.reject(error);
  }
);

// Example helper functions for cookies (get and set)
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const setCookie = (name, value) => {
  document.cookie = `${name}=${value}; path=/;`;
};


export default axiosInstance;
