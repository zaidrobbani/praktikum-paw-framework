import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authRepository } from "./action";
import { useAuthStore } from "@/frontend/stores/authStore";

export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const { setAccessToken, setUser, logout } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: authRepository.register,
    onSuccess: (result) => {
      if (result.success) {
        setAccessToken(result.data.accessToken);
        setUser(result.data.user);
        queryClient.setQueryData(["auth-me"], result.data.user);
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: authRepository.login,
    onSuccess: (result) => {
      if (result.success) {
        setAccessToken(result.data.accessToken);
        setUser(result.data.user);
        queryClient.setQueryData(["auth-me"], result.data.user);
      }
    },
  });

  const getMeQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await authRepository.me();
      if (!res.success) throw res.error;
      return res.data;
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: authRepository.logout,
    onSuccess: () => {
      logout();
      queryClient.removeQueries({ queryKey: ["auth-me"] });
      window.location.href = "/";
    },
  });

  return { registerMutation, loginMutation, getMeQuery, logoutMutation };
};
