import bcrypt from "bcryptjs";
import { authRepository } from "./auth.repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/backend/lib/jwt";
import type {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshResponseDto,
} from "./auth.dto";

const SALT_ROUNDS = 12;

// type untuk JWT payload
type JwtPayload = {
  userId: string;
  email: string;
};

export const authService = {
  register: async (dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string; user: AuthResponseDto["user"] }> => {
    const existingUser = await authRepository.findByEmail(dto.email);
    if (existingUser) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await authRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    const payload: JwtPayload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await authRepository.saveRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken, user };
  },

  login: async (dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: AuthResponseDto["user"] }> => {
    const user = await authRepository.findByEmail(dto.email);
    if (!user) throw new Error("Invalid email or password");

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new Error("Invalid email or password");

    const payload: JwtPayload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await authRepository.saveRefreshToken(user.id, hashedRefreshToken);

    const safeUser = authRepository.toSafeUser(user);
    return { accessToken, refreshToken, user: safeUser };
  },

  refresh: async (refreshToken: string): Promise<RefreshResponseDto & { refreshToken: string }> => {
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken) as JwtPayload;
    } catch {
      throw new Error("Invalid refresh token");
    }

    const user = await authRepository.findById(payload.userId);
    if (!user || !user.refreshToken) throw new Error("Refresh token not found");

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      await authRepository.clearRefreshToken(user.id);
      throw new Error("Refresh token reuse detected");
    }

    const newPayload: JwtPayload = { userId: user.id, email: user.email };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await authRepository.saveRefreshToken(user.id, hashedNewRefreshToken);

    const safeUser = authRepository.toSafeUser(user);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: safeUser };
  },

  logout: async (userId: string): Promise<void> => {
    await authRepository.clearRefreshToken(userId);
  },
};