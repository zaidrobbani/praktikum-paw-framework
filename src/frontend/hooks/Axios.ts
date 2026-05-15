import axios from "@/frontend/lib/axios";
import { useAuthStore } from "@/frontend/stores/authStore";

const Axios = () => {
  const { setAccessToken, logout } = useAuthStore.getState();
  const accessToken = useAuthStore.getState().accessToken;

  const axiosPublic = axios;

  // Clone axios instance for private requests
  const axiosPrivate = axios.create();

  // Inject token to every request
  axiosPrivate.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (!config.headers["Authorization"] && token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // Provide refresh token mechanism on 401
  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const prevRequest = error?.config as unknown as {
        _retry?: boolean;
        headers?: Record<string, string>;
      };

      if (error?.response?.status === 401 && !prevRequest?._retry) {
        prevRequest._retry = true;

        try {
          const { data } = await axiosPublic.post("/auth/refresh");
          const newAccessToken = data.accessToken;
          setAccessToken(newAccessToken);

          prevRequest.headers = prevRequest.headers ?? {};
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return axiosPrivate(prevRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );

  // accessToken is read above to ensure store is initialized; interceptors always read latest token.
  void accessToken;

  return { axiosPublic, axiosPrivate };
};

export default Axios;
