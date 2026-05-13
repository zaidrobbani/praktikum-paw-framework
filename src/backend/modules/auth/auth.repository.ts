// src/backend/modules/auth/auth.repository.ts
import { prisma } from "@/backend/config/prisma";
import type { UserResponseDto } from "./auth.dto";

export const authRepository = {
  // ── Find ───────────────────────────────────────────────

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // ── Create ─────────────────────────────────────────────

  create: async (data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserResponseDto> => {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // password TIDAK di-select — jangan pernah return password
      },
    });

    return user;
  },

  // ── Refresh Token ──────────────────────────────────────

  saveRefreshToken: async (userId: string, hashedToken: string) => {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  },

  clearRefreshToken: async (userId: string) => {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },

  // ── Safe User (tanpa password) ─────────────────────────

  toSafeUser: (user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }): UserResponseDto => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }),
};