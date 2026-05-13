// src/backend/modules/auth/auth.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "./auth.service";
import {
  validateRegisterDto,
  validateLoginDto,
  ValidationError,
} from "./auth.dto";

// ── Cookie Config ──────────────────────────────────────────

const REFRESH_TOKEN_COOKIE = "refreshToken";
const ACCESS_TOKEN_COOKIE = "accessToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 hari
};

const accessCookieOptions = {
  httpOnly: false, // supaya bisa dibaca state auth/frontend jika dibutuhkan atau true untuk full SSR secure
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 15, // cth: 15 menit
};

// ── Helper ─────────────────────────────────────────────────

function handleError(error: unknown) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { message: "Validation failed", errors: error.errors },
      { status: 422 },
    );
  }

  if (error instanceof Error) {
    const status =
      error.message.includes("Invalid") ||
      error.message.includes("not found") ||
      error.message.includes("reuse")
        ? 401
        : error.message.includes("already registered")
          ? 409
          : 500;

    return NextResponse.json({ message: error.message }, { status });
  }

  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 },
  );
}

// ── Controller ─────────────────────────────────────────────

export const authController = {
  // POST /api/auth/register
  register: async (req: NextRequest) => {
    try {
      const body = await req.json();
      const dto = validateRegisterDto(body);
      const { accessToken, refreshToken, user } =
        await authService.register(dto);

      const response = NextResponse.json(
        { accessToken, user },
        { status: 201 },
      );

      // set refreshToken sebagai httpOnly cookie
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        accessToken,
        accessCookieOptions,
      );

      return response;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /api/auth/login
  login: async (req: NextRequest) => {
    try {
      const body = await req.json();
      const dto = validateLoginDto(body);
      const { accessToken, refreshToken, user } = await authService.login(dto);

      const response = NextResponse.json({ accessToken, user });

      // set refreshToken sebagai httpOnly cookie
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        accessToken,
        accessCookieOptions,
      );

      return response;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /api/auth/refresh
  refresh: async (req: NextRequest) => {
    try {
      // ambil dari httpOnly cookie — bukan dari body/header
      const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { message: "No refresh token provided" },
          { status: 401 },
        );
      }

      const {
        accessToken,
        refreshToken: newRefreshToken,
        user,
      } = await authService.refresh(refreshToken);

      const response = NextResponse.json({ accessToken, user });

      // rotate: set cookie dengan refresh token baru
      response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        newRefreshToken,
        cookieOptions,
      );
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        accessToken,
        accessCookieOptions,
      );

      return response;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /api/auth/logout
  logout: async (req: NextRequest) => {
    try {
      // ambil userId dari header yang di-inject oleh withAuth middleware
      const userId = req.headers.get("x-user-id");

      if (userId) {
        await authService.logout(userId);
      }

      const response = NextResponse.json({
        message: "Logged out successfully",
      });

      // hapus cookie
      response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        ...cookieOptions,
        maxAge: 0, // langsung expired
      });
      response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
        ...accessCookieOptions,
        maxAge: 0,
      });

      return response;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /api/auth/me
  me: async (req: NextRequest) => {
    try {
      const userId = req.headers.get("x-user-id");

      if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const { authRepository } = await import("./auth.repository");
      const user = await authRepository.findById(userId);

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ user: authRepository.toSafeUser(user) });
    } catch (error) {
      return handleError(error);
    }
  },
};
