import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  ProfileResponse,
} from "./dto";
import { tryCatch } from "@/frontend/lib/tryCatch";
import { ActionResult } from "@/frontend/lib/ResponseResult";
import Axios from "@/frontend/hooks/Axios";

const AxiosHelper = () => {
  return Axios();
};

const { axiosPublic, axiosPrivate } = AxiosHelper();

export const authRepository = {
  login: async (data: LoginRequest): Promise<ActionResult<LoginResponse>> => {
    const result = await tryCatch(
      axiosPublic.post<LoginResponse>("/auth/login", data),
    );

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },

  logout: async (): Promise<ActionResult<void>> => {
    const result = await tryCatch(axiosPublic.post("/auth/logout"));

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: undefined };
  },

  refresh: async (): Promise<ActionResult<RefreshResponse>> => {
    const result = await tryCatch(
      axiosPublic.post<RefreshResponse>("/auth/refresh"),
    );

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },

  register: async (
    data: RegisterRequest,
  ): Promise<ActionResult<RegisterResponse>> => {
    const result = await tryCatch(
      axiosPublic.post<RegisterResponse>("/auth/register", data),
    );

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },

  me: async (): Promise<ActionResult<ProfileResponse>> => {
    const result = await tryCatch(
      axiosPrivate.get<ProfileResponse>("/auth/me"),
    );

    if (result.error) {
      return { success: false, error: result.error as Error };
    }

    return { success: true, data: result.data.data };
  },
};
