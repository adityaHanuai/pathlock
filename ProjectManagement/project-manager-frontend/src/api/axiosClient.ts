import axios from "axios";

// Create an Axios instance with a base URL
const axiosClient = axios.create({
  // Set the base URL for all requests
  baseURL: "https://pathlockprojectmanage.onrender.com/api",
});

// Add a request interceptor to include the Authorization header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

//redirect to login when unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
