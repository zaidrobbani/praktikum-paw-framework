"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PawPrint, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import FormInput from "@/frontend/shared/FormInput";
import { useAuthQuery } from "@/frontend/repository/auth/query";
import { useAuthStore } from "@/frontend/stores/authStore";

// 1. Definisikan Schema Validasi menggunakan Zod
const registerSchema = z
  .object({
    name: z.string().nonempty("Nama lengkap wajib diisi"),
    email: z
      .string()
      .nonempty("Email wajib diisi")
      .email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().nonempty("Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

// Infer type dari schema
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterContainer() {
  const router = useRouter();
  const { registerMutation } = useAuthQuery();
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 2. Setup React Hook Form
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 3. Handle Submit
  const onSubmit = (data: RegisterFormValues) => {
    setGlobalError(null);

    const {  ...payload } = data;

    registerMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res.success) {
          router.push("/products");
        } else {
          setGlobalError(
            res.error?.message || "Terjadi kesalahan saat registrasi."
          );
        }
      },
      onError: (error) => {
        setGlobalError(error.message || "Terjadi kesalahan pada server.");
      },
    });
  };

  // Redirect jika sudah login
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (user) {
      router.replace("/products");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header / Brand */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-slate-100 mb-4">
            <PawPrint size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Buat Akun Baru</h1>
          <p className="text-slate-400">
            Daftar sekarang dan mulai gunakan PAW
          </p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {globalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              id="name"
              name="name"
              label="Nama Lengkap"
              type="text"
              placeholder="John Doe"
              control={control}
            />

            <FormInput
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="admin@example.com"
              control={control}
            />

            <FormInput
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              control={control}
            />

            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              label="Konfirmasi Password"
              type="password"
              placeholder="••••••••"
              control={control}
            />

            <button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {isSubmitting || registerMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Daftar</span>
                </>
              )}
            </button>
          </form>

          {/* Footer — nudge ke login */}
          <div className="mt-8 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="font-semibold text-slate-900 hover:underline"
            >
              Masuk sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}