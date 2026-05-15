"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PawPrint, LogIn, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import FormInput from "@/frontend/shared/FormInput";
import { useAuthQuery } from "@/frontend/repository/auth/query";
import { useAuthStore } from "@/frontend/stores/authStore";

// 1. Definisikan Schema Validasi menggunakan Zod
const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// Infer type dari schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginContainer() {
  const router = useRouter();
  const { loginMutation } = useAuthQuery();
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 2. Setup React Hook Form
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Handle Submit
  const onSubmit = (data: LoginFormValues) => {
    setGlobalError(null);
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.success) {
          router.push("/products");
        } else {
          setGlobalError(res.error?.message || "Terjadi kesalahan saat login.");
        }
      },
      onError: (error) => {
        setGlobalError(error.message || "Terjadi kesalahan pada server.");
      },
    });
  };

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
          <h1 className="text-2xl font-bold text-white mb-2">Selamat Datang</h1>
          <p className="text-slate-400">
            Masuk ke akun PAW Anda untuk melanjutkan
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

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {isSubmitting || loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Let's add simple register nudge */}
          <div className="mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="font-semibold text-slate-900 hover:underline"
            >
              Daftar sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
