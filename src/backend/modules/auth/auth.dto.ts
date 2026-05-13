// src/backend/modules/auth/auth.dto.ts

// ── Raw Input Type (unknown body dari req.json()) ─────────

type RawInput = Record<string, unknown>;

// ── Request DTOs ──────────────────────────────────────────

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ── Response DTOs ─────────────────────────────────────────

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
  // refreshToken TIDAK dikirim ke client response — hanya dipakai untuk set cookie
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

// ── Custom Error ──────────────────────────────────────────

export class ValidationError extends Error {
  public errors: string[];

  constructor(errors: string[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

// ── Type Guards ───────────────────────────────────────────

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && (value as string).trim().length > 0;
}

function isRawInput(value: unknown): value is RawInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ── Validation Helpers ────────────────────────────────────

export function validateRegisterDto(body: unknown): RegisterDto {
  const errors: string[] = [];

  if (!isRawInput(body)) {
    throw new ValidationError(["Request body must be a JSON object"]);
  }

  // validate email
  if (!isNonEmptyString(body.email as string)) {
    errors.push("email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email as string)) {
    errors.push("email is invalid");
  }

  // validate password
  if (!isNonEmptyString(body.password as string)) {
    errors.push("password is required");
  } else if ((body.password as string).length < 8) {
    errors.push("password must be at least 8 characters");
  }

  // validate name
  if (!isNonEmptyString(body.name as string)) {
    errors.push("name is required");
  } else if ((body.name as string).trim().length < 2) {
    errors.push("name must be at least 2 characters");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  // safe to cast setelah semua validasi lolos
  return {
    email: (body.email as string).toLowerCase().trim(),
    password: body.password as string,
    name: (body.name as string).trim(),
  };
}

export function validateLoginDto(body: unknown): LoginDto {
  const errors: string[] = [];

  if (!isRawInput(body)) {
    throw new ValidationError(["Request body must be a JSON object"]);
  }

  if (!isNonEmptyString(body.email as string)) {
    errors.push("email is required");
  }

  if (!isNonEmptyString(body.password as string)) {
    errors.push("password is required");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return {
    email: (body.email as string).toLowerCase().trim(),
    password: body.password as string,
  };
}