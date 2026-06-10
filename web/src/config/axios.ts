import axios from "axios";
import Cookies from "js-cookie";

import { handleUnauthorized } from "src/config/auth-session";

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("jwt");
      await handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
