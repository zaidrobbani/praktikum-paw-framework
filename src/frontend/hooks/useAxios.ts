import { useEffect } from "react";
import axios from "@/frontend/lib/axios";
import { useAuthStore } from "@/frontend/stores/authStore";

const useAxios = () => {
  const { accessToken, setAccessToken, logout } = useAuthStore();

  const axiosPublic = axios;

  // Clone axios instance for private requests
  const axiosPrivate = axios.create();

  useEffect(() => {
    // Inject token to every request
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"] && accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Provide refresh token mechanism on 401
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true;

          try {
            const { data } = await axiosPublic.post("/auth/refresh");
            const newAccessToken = data.accessToken;
            setAccessToken(newAccessToken);
            
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, setAccessToken, logout, axiosPrivate, axiosPublic]);

  return { axiosPublic, axiosPrivate };
};

export default useAxios;
