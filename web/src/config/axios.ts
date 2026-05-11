import axios from "axios";
import Cookies from "js-cookie";

import { useWeb3AuthContext } from "src/context/web3-auth-context";
const baseURL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use(async (config) => {
  const jwt = Cookies.get("jwt");
  // Avoid sending `Bearer undefined` which triggers `jwt malformed` on the backend.
  if (jwt) {
    config.headers["Authorization"] = `Bearer ${jwt}`;
  } else {
    delete config.headers["Authorization"];
  }

  return config;
});

// Interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Assuming you have a context to provide the logout function
      const { logout } = useWeb3AuthContext();
      if (logout) {
        await logout();
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
