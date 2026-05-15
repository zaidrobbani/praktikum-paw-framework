// AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/frontend/stores/authStore";
import { useAuthQuery } from "@/frontend/repository/auth/query";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setUser, logout } = useAuthStore();
  const { getMeQuery } = useAuthQuery();
  const router = useRouter();
  const PUBLIC_ROUTES = ["/login", "/register"];
  const isPublicPage = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const { isPending, isError, isSuccess, data } = getMeQuery;

  useEffect(() => {
    if (isError && !isPublicPage) {
      logout();
      if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
        router.replace("/login");
      }
      return;
    }

    if (isSuccess && data?.user) {
      setUser(data.user);
    }
  }, [
    isPending,
    isError,
    isSuccess,
    data,
    logout,
    setUser,
    router,
    pathname,
    isPublicPage,
  ]);

  return <>{children}</>;
}
